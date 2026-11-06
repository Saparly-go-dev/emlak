import type { SQLInputValue } from "node:sqlite";
import type { Entity, ListQuery, Page, Records } from "@mekan/contracts";
import type { DB } from "./database.js";
import { assert } from "./errors.js";
const amounts = ["price", "budgetMax", "amount"];
export function decode<T>(row: unknown): T {
  const result = { ...(row as Record<string, unknown>) };
  for (const key of amounts)
    if (key in result) result[key] = Number(result[key]) / 100;
  return result as T;
}
export function find<K extends Entity>(
  db: DB,
  table: K,
  id: number,
): Records[K] {
  const row = db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id);
  assert(row, "notFound", 404);
  return decode<Records[K]>(row);
}
const searchFields = {
  properties: ["title", "address", "district"],
  clients: ["name", "email", "phone", "district"],
  deals: ["p.title", "c.name"],
  viewings: ["p.title", "c.name"],
};
export function list<K extends Entity>(
  db: DB,
  table: K,
  q: ListQuery,
): Page<Records[K]> {
  const linked = table === "deals" || table === "viewings";
  const alias = linked ? "r." : "";
  const from = linked
    ? `${table} r JOIN properties p ON p.id=r.propertyId JOIN clients c ON c.id=r.clientId`
    : table;
  const clauses: string[] = [],
    values: SQLInputValue[] = [];
  if (q.q) {
    clauses.push(
      `(${searchFields[table].map((f) => `casefold(${f}) LIKE casefold(?) ESCAPE '\\'`).join(" OR ")})`,
    );
    const term = "%" + q.q.replace(/[\\%_]/g, "\\$&") + "%";
    values.push(...searchFields[table].map(() => term));
  }
  if (q.status) {
    clauses.push(`${alias}${table === "deals" ? "stage" : "status"}=?`);
    values.push(q.status);
  }
  if (q.dealType && (table === "properties" || table === "clients")) {
    clauses.push("dealType=?");
    values.push(q.dealType);
  }
  const where = clauses.length ? " WHERE " + clauses.join(" AND ") : "";
  const total = Number(
    db.prepare(`SELECT COUNT(*) AS total FROM ${from}${where}`).get(...values)!
      .total,
  );
  const selection = linked
    ? "r.*,p.title AS propertyTitle,c.name AS clientName"
    : "*";
  const order =
    table === "viewings"
      ? "r.startsAt ASC"
      : `${alias}id ${q.sort === "oldest" ? "ASC" : "DESC"}`;
  const items = db
    .prepare(
      `SELECT ${selection} FROM ${from}${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
    )
    .all(...values, q.pageSize, (q.page - 1) * q.pageSize)
    .map((row) => decode<Records[K]>(row));
  return {
    items,
    total,
    page: q.page,
    pageSize: q.pageSize,
    pages: Math.ceil(total / q.pageSize),
  };
}
export function write(
  db: DB,
  table: Entity,
  input: Record<string, unknown>,
  actor: number,
  id?: number,
  version?: number,
) {
  const data: Record<string, SQLInputValue> = {};
  for (const [key, value] of Object.entries(input))
    data[key] = amounts.includes(key)
      ? Math.round(Number(value) * 100)
      : (value as SQLInputValue);
  data.updatedAt = new Date().toISOString();
  if (id) {
    const keys = Object.keys(data);
    const result = db
      .prepare(
        `UPDATE ${table} SET ${keys.map((k) => `${k}=?`).join(",")},version=version+1 WHERE id=? AND version=?`,
      )
      .run(...keys.map((k) => data[k]), id, version!);
    assert(result.changes === 1, "conflict", 409);
  } else {
    data.createdBy = actor;
    data.createdAt = data.updatedAt;
    const keys = Object.keys(data);
    id = Number(
      db
        .prepare(
          `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
        )
        .run(...keys.map((k) => data[k])).lastInsertRowid,
    );
  }
  return find(db, table, id);
}
