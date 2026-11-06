import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { entityNames } from "@mekan/contracts";
export type DB = DatabaseSync;
export function transaction<T>(db: DB, fn: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
const meta = `id INTEGER PRIMARY KEY AUTOINCREMENT, createdBy INTEGER NOT NULL REFERENCES users(id), createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1`;
const common = `type TEXT NOT NULL CHECK(type IN ('apartment','house','office','commercial','land')), dealType TEXT NOT NULL CHECK(dealType IN ('sale','rent')), currency TEXT NOT NULL CHECK(currency IN ('TMT','USD')), rentPeriod TEXT NOT NULL CHECK(rentPeriod IN ('month','day')), rooms INTEGER NOT NULL CHECK(rooms>=0), notes TEXT NOT NULL DEFAULT ''`;
const schema = `
CREATE TABLE users(id INTEGER PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE COLLATE NOCASE,password TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('admin','agent')),active INTEGER NOT NULL DEFAULT 1,version INTEGER NOT NULL DEFAULT 1,createdAt TEXT NOT NULL);
CREATE TABLE sessions(token TEXT PRIMARY KEY,userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE properties(${meta},${common},title TEXT NOT NULL,address TEXT NOT NULL,district TEXT NOT NULL,price INTEGER NOT NULL CHECK(price>0),area REAL NOT NULL CHECK(area>0),owner TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',status TEXT NOT NULL CHECK(status IN ('available','reserved','closed')));
CREATE TABLE clients(${meta},${common},name TEXT NOT NULL,phone TEXT NOT NULL,email TEXT NOT NULL DEFAULT '',district TEXT NOT NULL DEFAULT '',budgetMax INTEGER NOT NULL CHECK(budgetMax>0),minArea REAL NOT NULL CHECK(minArea>=0),status TEXT NOT NULL CHECK(status IN ('new','contacted','viewed','negotiating','won','lost')));
CREATE TABLE deals(${meta},propertyId INTEGER NOT NULL REFERENCES properties(id),clientId INTEGER NOT NULL REFERENCES clients(id),amount INTEGER NOT NULL CHECK(amount>0),currency TEXT NOT NULL CHECK(currency IN ('TMT','USD')),stage TEXT NOT NULL CHECK(stage IN ('new','viewed','negotiating','documents','won','lost')),notes TEXT NOT NULL DEFAULT '');
CREATE TABLE viewings(${meta},propertyId INTEGER NOT NULL REFERENCES properties(id),clientId INTEGER NOT NULL REFERENCES clients(id),startsAt TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('scheduled','done','cancelled')),notes TEXT NOT NULL DEFAULT '');
CREATE TABLE audit(id INTEGER PRIMARY KEY AUTOINCREMENT,actorId INTEGER REFERENCES users(id),action TEXT NOT NULL,entity TEXT NOT NULL,recordId INTEGER NOT NULL,createdAt TEXT NOT NULL);
CREATE INDEX idx_properties_status ON properties(status,dealType,type);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_property ON deals(propertyId);
CREATE INDEX idx_deals_client ON deals(clientId);
CREATE INDEX idx_viewings_time ON viewings(startsAt,status);
CREATE INDEX idx_viewings_property ON viewings(propertyId);
CREATE INDEX idx_viewings_client ON viewings(clientId);
CREATE INDEX idx_sessions_expiry ON sessions(expires);
CREATE INDEX idx_audit_created ON audit(createdAt);
`;
export function openDatabase(path: string): DB {
  if (path !== ":memory:")
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  db.function("casefold", { deterministic: true }, (value) =>
    String(value ?? "").toLowerCase(),
  );
  db.exec(
    "PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000",
  );
  db.exec(
    "CREATE TABLE IF NOT EXISTS migrations(version INTEGER PRIMARY KEY,name TEXT NOT NULL,appliedAt TEXT NOT NULL)",
  );
  if (!db.prepare("SELECT 1 FROM migrations WHERE version=1").get()) {
    const legacy = db
      .prepare(
        "SELECT name FROM pragma_table_info('properties') WHERE name='body'",
      )
      .get();
    db.exec("PRAGMA foreign_keys=OFF");
    try {
      transaction(db, () => {
        if (legacy)
          for (const table of ["users", "sessions", ...entityNames])
            db.exec(`ALTER TABLE ${table} RENAME TO legacy_${table}`);
        db.exec(schema);
        if (legacy) {
          db.exec(
            "INSERT INTO users(id,name,email,password,role,createdAt) SELECT id,name,email,password,role,createdAt FROM legacy_users",
          );
          for (const table of entityNames) {
            const columns = new Set(
              db
                .prepare(`PRAGMA table_info(${table})`)
                .all()
                .map((c) => String(c.name)),
            );
            for (const row of db
              .prepare(`SELECT * FROM legacy_${table}`)
              .all()) {
              const data: Record<string, SQLInputValue> = {
                ...JSON.parse(String(row.body)),
                id: row.id,
                createdBy: row.createdBy,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                version: row.version,
              };
              if (table === "deals" || table === "viewings") {
                data.propertyId = row.propertyId;
                data.clientId = row.clientId;
              }
              for (const field of ["price", "budgetMax", "amount"])
                if (field in data)
                  data[field] = Math.round(Number(data[field]) * 100);
              const keys = Object.keys(data).filter((k) => columns.has(k));
              db.prepare(
                `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
              ).run(...keys.map((k) => data[k]));
            }
          }
          for (const table of [
            "viewings",
            "deals",
            "clients",
            "properties",
            "sessions",
            "users",
          ])
            db.exec(`DROP TABLE legacy_${table}`);
        }
        if (db.prepare("PRAGMA foreign_key_check").all().length)
          throw Error("Migration foreign key check failed");
        db.prepare("INSERT INTO migrations VALUES(1,?,?)").run(
          "normalized_schema_v2",
          new Date().toISOString(),
        );
      });
    } finally {
      db.exec("PRAGMA foreign_keys=ON");
    }
  }
  return db;
}
export function audit(
  db: DB,
  actorId: number,
  action: string,
  entity: string,
  recordId: number,
) {
  db.prepare(
    "INSERT INTO audit(actorId,action,entity,recordId,createdAt) VALUES(?,?,?,?,?)",
  ).run(actorId, action, entity, recordId, new Date().toISOString());
}
