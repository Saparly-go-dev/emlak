import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { HTTPMethods } from "fastify";
import { createApp } from "../src/app.js";
import type { Config } from "../src/config.js";
import { recommend } from "../src/modules/matching.js";
import { propertySchema, type Property, type Client } from "@mekan/contracts";
export const property = {
  title: "Квартира / Apartment / Kwartira",
  address: "Aşgabat",
  district: "Aşgabat",
  type: "apartment" as const,
  dealType: "sale" as const,
  currency: "TMT" as const,
  rentPeriod: "month" as const,
  rooms: 3,
  notes: "",
  price: 500000.25,
  area: 100,
  owner: "",
  phone: "",
  status: "available" as const,
};
const client = {
  name: "Client",
  phone: "+993 65",
  email: "",
  district: "Aşgabat",
  type: "apartment",
  dealType: "sale",
  currency: "TMT",
  rentPeriod: "month",
  rooms: 3,
  notes: "",
  budgetMax: 550000,
  minArea: 80,
  status: "new",
};
test("contract rejects fractional minor units and unknown fields", () => {
  assert.equal(
    propertySchema.safeParse({ ...property, price: 0.001 }).success,
    false,
  );
  assert.equal(
    propertySchema.safeParse({ ...property, unexpected: true }).success,
    false,
  );
  assert.equal(propertySchema.safeParse(property).success, true);
});
test("recommendations exclude unavailable and incompatible listings", () => {
  const meta = {
    id: 1,
    createdBy: 1,
    createdAt: "",
    updatedAt: "",
    version: 1,
  };
  const p = { ...property, ...meta };
  const c = { ...client, ...meta } as Client;
  assert.equal(recommend(c, [p])[0].score, 100);
  assert.equal(
    recommend(c, [
      { ...p, status: "reserved" },
      { ...p, currency: "USD" },
      { ...p, dealType: "rent" },
    ]).length,
    0,
  );
  const match = recommend(c, [
    { ...p, price: 700000, area: 60, rooms: 2, district: "Mary" },
  ])[0];
  assert.ok(match.score < 100);
  assert.equal(
    match.criteria.reduce((s, c) => s + c.value, 0),
    match.score,
  );
});
test("versioned API end-to-end with persistence and permissions", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "mekan-v2-test-"));
  const config: Config = {
    port: 0,
    host: "127.0.0.1",
    dbPath: join(directory, "test.sqlite"),
    origin: "http://127.0.0.1:5173",
    secure: false,
    production: false,
    logLevel: "silent",
    webRoot: join(directory, "no-web"),
  };
  let app = await createApp(config);
  await app.ready();
  t.after(async () => {
    await app.close();
    rmSync(directory, { recursive: true, force: true });
  });
  let cookie = "",
    csrf = "";
  async function request(
    path: string,
    method: HTTPMethods = "GET",
    body?: unknown,
    headers: Record<string, string> = {},
  ) {
    return app.inject({
      url: "/api/v1" + path,
      method,
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(csrf ? { "x-csrf-token": csrf } : {}),
        ...headers,
      },
      ...(body ? { payload: body as Record<string, unknown> } : {}),
    });
  }
  const login = (r: Awaited<ReturnType<typeof request>>) => {
    cookie = String(r.headers["set-cookie"]).split(";")[0];
    csrf = r.json().csrf;
  };
  let p: Property,
    c: { id: number; version: number },
    deal: { id: number; version: number },
    viewing: { id: number; version: number },
    agent: { id: number; version: number },
    adminCookie: string,
    adminCsrf: string;
  await t.test(
    "OpenAPI and health are available; private data requires auth",
    async () => {
      assert.equal((await request("/health")).statusCode, 200);
      assert.equal((await request("/properties")).statusCode, 401);
      const spec = await app.inject("/docs/json");
      assert.equal(spec.statusCode, 200);
      assert.ok(spec.json().paths["/api/v1/properties"]);
      assert.ok(
        spec.json().paths["/api/v1/properties"].get.responses["200"].content[
          "application/json"
        ].schema.properties.items,
      );
      assert.equal((await app.inject("/docs/")).statusCode, 200);
    },
  );
  await t.test(
    "first-run administrator registration closes after creation",
    async () => {
      assert.equal((await request("/auth/session")).json().setupRequired, true);
      const r = await request("/auth/setup", "POST", {
        name: "Admin",
        email: "admin@example.test",
        password: "a-long-test-password",
      });
      assert.equal(r.statusCode, 201, r.body);
      login(r);
      adminCookie = cookie;
      adminCsrf = csrf;
      assert.ok(!("password" in r.json().user));
      assert.equal(r.json().user.active, true);
      assert.equal(
        (
          await request("/auth/setup", "POST", {
            name: "Other",
            email: "other@example.test",
            password: "a-long-test-password",
          })
        ).statusCode,
        409,
      );
    },
  );
  await t.test(
    "CSRF and origin guards reject unauthorized writes",
    async () => {
      assert.equal(
        (await request("/properties", "POST", property, { "x-csrf-token": "" }))
          .statusCode,
        403,
      );
      assert.equal(
        (
          await request("/properties", "POST", property, {
            origin: "https://foreign.example",
          })
        ).statusCode,
        403,
      );
      assert.equal(
        (
          await request("/properties", "POST", property, {
            "sec-fetch-site": "cross-site",
          })
        ).statusCode,
        403,
      );
    },
  );
  await t.test(
    "CRUD validates input, stores decimals and returns request IDs on error",
    async () => {
      const invalid = await request("/properties", "POST", {
        ...property,
        price: -1,
      });
      assert.equal(invalid.statusCode, 400);
      assert.equal(invalid.json().error.code, "validation");
      assert.ok(invalid.json().error.requestId);
      const r = await request("/properties", "POST", property);
      assert.equal(r.statusCode, 201, r.body);
      p = r.json();
      assert.equal(p.price, 500000.25);
      const r2 = await request("/clients", "POST", client);
      assert.equal(r2.statusCode, 201, r2.body);
      c = r2.json();
      assert.equal(
        (await request(`/clients/${c.id}/recommendations`)).json()[0].score,
        100,
      );
    },
  );
  await t.test(
    "pagination, filters and literal wildcard search work on server",
    async () => {
      await request("/properties", "POST", {
        ...property,
        title: "Änew property",
        status: "reserved",
      });
      const result = await request("/properties?page=1&pageSize=1");
      assert.equal(result.json().total, 2);
      assert.equal(result.json().items.length, 1);
      assert.equal(result.json().pages, 2);
      assert.equal(
        (await request("/properties?status=available")).json().total,
        1,
      );
      assert.equal((await request("/properties?q=%25")).json().total, 0);
      assert.equal(
        (await request("/properties?q=" + encodeURIComponent("äNEW"))).json()
          .total,
        1,
      );
      assert.equal((await request("/properties?pageSize=999")).statusCode, 400);
    },
  );
  await t.test("optimistic locking protects record edits", async () => {
    const input = {
      ...property,
      version: p.version,
      title: "Updated property",
    };
    const r = await request("/properties/" + p.id, "PUT", input);
    assert.equal(r.statusCode, 200, r.body);
    assert.equal(
      (await request("/properties/" + p.id, "PUT", input)).statusCode,
      409,
    );
    p = r.json();
  });
  await t.test(
    "links, scheduling conflicts and foreign key deletion are enforced",
    async () => {
      const r = await request("/deals", "POST", {
        propertyId: p.id,
        clientId: c.id,
        amount: 490000.5,
        stage: "won",
        notes: "",
      });
      assert.equal(r.statusCode, 201, r.body);
      deal = r.json();
      const body = {
        propertyId: p.id,
        clientId: c.id,
        startsAt: "2027-01-10T10:00:00.000Z",
        status: "scheduled",
        notes: "",
      };
      const v = await request("/viewings", "POST", body);
      assert.equal(v.statusCode, 201, v.body);
      viewing = v.json();
      assert.equal(
        (
          await request("/viewings", "POST", {
            ...body,
            startsAt: "2027-01-10T10:30:00.000Z",
          })
        ).statusCode,
        409,
      );
      assert.equal(
        (
          await request("/properties/" + p.id, "DELETE", undefined, {
            "if-match": String(p.version),
          })
        ).json().error.code,
        "inUse",
      );
      assert.equal(
        (await request("/dashboard")).json().volume[0].amount,
        490000.5,
      );
    },
  );
  await t.test("audit records only committed changes", async () => {
    const result = await request("/audit");
    assert.equal(result.statusCode, 200);
    assert.ok(
      result
        .json()
        .items.some(
          (a: { entity: string; action: string }) =>
            a.entity === "properties" && a.action === "update",
        ),
    );
    assert.ok(
      !result
        .json()
        .items.some((a: { action: string }) => a.action === "delete"),
    );
  });
  await t.test(
    "agents cannot manage team, delete records or read audit",
    async () => {
      const r = await request("/users", "POST", {
        name: "Agent",
        email: "agent@example.test",
        password: "agent-test-password",
        role: "agent",
      });
      assert.equal(r.statusCode, 201, r.body);
      agent = r.json();
      login(
        await request("/auth/login", "POST", {
          email: "agent@example.test",
          password: "agent-test-password",
        }),
      );
      for (const path of ["/users", "/audit"])
        assert.equal((await request(path)).statusCode, 403);
      assert.equal(
        (
          await request("/properties/" + p.id, "DELETE", undefined, {
            "if-match": String(p.version),
          })
        ).statusCode,
        403,
      );
      assert.equal((await request("/properties")).statusCode, 200);
      const agentCookie = cookie,
        agentCsrf = csrf;
      cookie = adminCookie;
      csrf = adminCsrf;
      assert.equal(
        (
          await request("/users/" + agent.id, "PUT", {
            name: "Agent",
            role: "agent",
            active: false,
            version: agent.version,
          })
        ).statusCode,
        200,
      );
      assert.equal(
        (
          await request("/properties", "GET", undefined, {
            cookie: agentCookie,
            "x-csrf-token": agentCsrf,
          })
        ).statusCode,
        401,
      );
      assert.equal(
        (
          await request("/auth/login", "POST", {
            email: "agent@example.test",
            password: "agent-test-password",
          })
        ).statusCode,
        401,
      );
    },
  );
  await t.test("administrator cannot disable own account", async () => {
    const me = (await request("/auth/session")).json().user;
    assert.equal(
      (
        await request("/users/" + me.id, "PUT", {
          name: me.name,
          role: "agent",
          active: true,
          version: me.version,
        })
      ).json().error.code,
      "selfDeactivate",
    );
  });
  await t.test(
    "password change revokes old sessions and preserves current access",
    async () => {
      const oldCookie = cookie,
        oldCsrf = csrf;
      const changed = await request("/auth/password", "POST", {
        currentPassword: "a-long-test-password",
        newPassword: "new-long-password",
      });
      assert.equal(changed.statusCode, 200, changed.body);
      login(changed);
      assert.equal(
        (
          await request("/properties", "GET", undefined, {
            cookie: oldCookie,
            "x-csrf-token": oldCsrf,
          })
        ).statusCode,
        401,
      );
      assert.equal((await request("/properties")).statusCode, 200);
      assert.equal(
        (
          await request("/auth/login", "POST", {
            email: "admin@example.test",
            password: "a-long-test-password",
          })
        ).statusCode,
        401,
      );
    },
  );
  await t.test("data, migrations and sessions survive restart", async () => {
    await app.close();
    app = await createApp(config);
    await app.ready();
    assert.equal(
      (await request("/properties/" + p.id)).json().title,
      "Updated property",
    );
    assert.equal((await request("/auth/session")).json().user.name, "Admin");
  });
  await t.test(
    "deletion checks versions and removes unreferenced records",
    async () => {
      assert.equal(
        (
          await request("/properties/" + p.id, "DELETE", undefined, {
            "if-match": "1",
          })
        ).statusCode,
        409,
      );
      for (const [table, row] of [
        ["deals", deal],
        ["viewings", viewing],
        ["properties", p],
        ["clients", c],
      ] as const)
        assert.equal(
          (
            await request("/" + table + "/" + row.id, "DELETE", undefined, {
              "if-match": String(row.version),
            })
          ).statusCode,
          200,
        );
      assert.equal((await request("/auth/logout", "POST")).statusCode, 200);
      assert.equal((await request("/properties")).statusCode, 401);
    },
  );
});
