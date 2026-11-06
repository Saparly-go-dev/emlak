import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { openDatabase } from "../src/database.js";
import { find } from "../src/repository.js";
const property = {
  title: "Legacy property",
  address: "Aşgabat",
  district: "Aşgabat",
  type: "apartment",
  dealType: "sale",
  currency: "TMT",
  rentPeriod: "month",
  rooms: 3,
  notes: "",
  price: 500000.25,
  area: 100,
  owner: "",
  phone: "",
  status: "available",
};
test("v1 JSON database migrates to normalized tables without losing users or records", () => {
  const directory = mkdtempSync(join(tmpdir(), "mekan-migration-")),
    path = join(directory, "old.sqlite");
  const old = new DatabaseSync(path),
    time = new Date().toISOString();
  old.exec(
    `CREATE TABLE users(id INTEGER PRIMARY KEY,name TEXT,email TEXT,password TEXT,role TEXT,createdAt TEXT);CREATE TABLE sessions(token TEXT PRIMARY KEY,userId INTEGER,csrf TEXT,expires INTEGER);`,
  );
  for (const table of ["properties", "clients", "deals", "viewings"])
    old.exec(
      `CREATE TABLE ${table}(id INTEGER PRIMARY KEY,body TEXT,createdBy INTEGER,createdAt TEXT,updatedAt TEXT,version INTEGER${["deals", "viewings"].includes(table) ? ",propertyId INTEGER,clientId INTEGER" : ""})`,
    );
  old
    .prepare("INSERT INTO users VALUES(1,?,?,?,?,?)")
    .run("Admin", "admin@example.test", "unchanged-hash", "admin", time);
  old
    .prepare("INSERT INTO sessions VALUES(?,?,?,?)")
    .run("old-token", 1, "csrf", Date.now() + 10000);
  old
    .prepare("INSERT INTO properties VALUES(1,?,1,?,?,3)")
    .run(JSON.stringify(property), time, time);
  old
    .prepare("INSERT INTO clients VALUES(1,?,1,?,?,1)")
    .run(
      JSON.stringify({
        name: "Client",
        phone: "+993",
        email: "",
        district: "",
        type: "apartment",
        dealType: "sale",
        currency: "TMT",
        rentPeriod: "month",
        rooms: 0,
        notes: "",
        budgetMax: 600000,
        minArea: 0,
        status: "new",
      }),
      time,
      time,
    );
  old
    .prepare("INSERT INTO deals VALUES(1,?,1,?,?,1,1,1)")
    .run(
      JSON.stringify({
        propertyId: 1,
        clientId: 1,
        currency: "TMT",
        amount: 490000.5,
        stage: "won",
        notes: "",
      }),
      time,
      time,
    );
  old.close();
  let db = openDatabase(path);
  try {
    assert.equal(find(db, "properties", 1).price, 500000.25);
    assert.equal(find(db, "properties", 1).version, 3);
    assert.equal(
      db.prepare("SELECT price FROM properties").get()!.price,
      50000025,
    );
    assert.equal(find(db, "deals", 1).amount, 490000.5);
    assert.equal(
      db.prepare("SELECT password FROM users").get()!.password,
      "unchanged-hash",
    );
    assert.equal(db.prepare("SELECT COUNT(*) n FROM sessions").get()!.n, 0);
    assert.equal(db.prepare("PRAGMA foreign_key_check").all().length, 0);
    assert.equal(db.prepare("SELECT COUNT(*) n FROM migrations").get()!.n, 1);
    db.close();
    db = openDatabase(path);
    assert.equal(find(db, "properties", 1).price, 500000.25);
    assert.equal(db.prepare("SELECT COUNT(*) n FROM migrations").get()!.n, 1);
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
