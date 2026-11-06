import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { randomBytes, createHash, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { User, Session } from "@mekan/contracts";
import {
  loginSchema,
  setupSchema,
  changePasswordSchema,
  userSchema,
  userUpdateSchema,
  listQuerySchema,
} from "@mekan/contracts";
import { z } from "zod";
import type { DB } from "../database.js";
import { audit, transaction } from "../database.js";
import type { Config } from "../config.js";
import { assert } from "../errors.js";
const derive = promisify(scrypt);
const digest = (s: string) => createHash("sha256").update(s).digest("hex");
export async function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${((await derive(password, salt, 64)) as Buffer).toString("hex")}`;
}
async function verify(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  return timingSafeEqual(
    (await derive(password, salt, 64)) as Buffer,
    Buffer.from(key, "hex"),
  );
}
export type StoredUser = User & { password: string; active: number };
export function publicUser(row: Record<string, unknown>): User {
  return {
    id: Number(row.id),
    name: String(row.name),
    email: String(row.email),
    role: row.role as User["role"],
    active: Boolean(row.active),
    version: Number(row.version),
  };
}
declare module "fastify" {
  interface FastifyRequest {
    account: User | null;
    sessionToken: string | null;
    csrf: string | null;
  }
  interface FastifyContextConfig {
    public?: boolean;
  }
}
export const jsonSchema = (s: z.ZodType) =>
  z.toJSONSchema(s, { io: "input", unrepresentable: "any", target: "draft-7" });
export async function requireAdmin(req: FastifyRequest) {
  assert(req.account?.role === "admin", "forbidden", 403);
}
export async function authModule(app: FastifyInstance, db: DB, config: Config) {
  const dummy = await passwordHash(randomBytes(32).toString("hex"));
  const cookieOptions = {
    httpOnly: true,
    sameSite: "strict" as const,
    path: "/",
    secure: config.secure,
    maxAge: 604800,
  };
  const session = (reply: FastifyReply, user: User): Session => {
    const token = randomBytes(32).toString("hex"),
      csrf = randomBytes(24).toString("hex");
    db.prepare("DELETE FROM sessions WHERE expires < ?").run(Date.now());
    db.prepare("INSERT INTO sessions VALUES(?,?,?,?)").run(
      digest(token),
      user.id,
      csrf,
      Date.now() + 604800000,
    );
    reply.setCookie("mekan_session", token, cookieOptions);
    return { user, csrf, setupRequired: false };
  };
  app.decorateRequest("account", null);
  app.decorateRequest("sessionToken", null);
  app.decorateRequest("csrf", null);
  app.addHook("onRequest", async (req, reply) => {
    if (!req.url.startsWith("/api/")) return;
    reply.header("Cache-Control", "no-store");
    const token = req.cookies.mekan_session;
    if (token) {
      const row = db
        .prepare(
          "SELECT users.*,sessions.csrf,sessions.token FROM sessions JOIN users ON users.id=sessions.userId WHERE token=? AND expires>? AND users.active=1",
        )
        .get(digest(token), Date.now());
      if (row) {
        req.account = publicUser(row);
        req.sessionToken = String(row.token);
        req.csrf = String(row.csrf);
      }
    }
    const writing = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    if (writing) {
      assert(
        !req.headers.origin || req.headers.origin === config.origin,
        "forbidden",
        403,
      );
      assert(req.headers["sec-fetch-site"] !== "cross-site", "forbidden", 403);
    }
    if (!req.routeOptions.config.public) {
      assert(req.account, "unauthorized", 401);
      if (writing)
        assert(req.headers["x-csrf-token"] === req.csrf, "forbidden", 403);
    }
  });
  const publicConfig = {
    public: true,
    rateLimit: { max: 20, timeWindow: "15 minutes" },
  };
  app.get(
    "/api/v1/auth/session",
    {
      config: { public: true },
      schema: {
        tags: ["Auth"],
        summary: "Current session and first-run status",
      },
    },
    async (req) => ({
      user: req.account,
      csrf: req.csrf,
      setupRequired: !db.prepare("SELECT id FROM users LIMIT 1").get(),
    }),
  );
  app.post(
    "/api/v1/auth/setup",
    {
      config: publicConfig,
      schema: {
        tags: ["Auth"],
        summary: "Create the first administrator",
        body: jsonSchema(setupSchema),
      },
    },
    async (req, reply) => {
      const body = setupSchema.parse(req.body);
      assert(
        !db.prepare("SELECT id FROM users LIMIT 1").get(),
        "setupComplete",
        409,
      );
      const password = await passwordHash(body.password);
      return transaction(db, () => {
        assert(
          !db.prepare("SELECT id FROM users LIMIT 1").get(),
          "setupComplete",
          409,
        );
        const id = Number(
          db
            .prepare(
              "INSERT INTO users(name,email,password,role,createdAt) VALUES(?,?,?,?,?)",
            )
            .run(
              body.name,
              body.email,
              password,
              "admin",
              new Date().toISOString(),
            ).lastInsertRowid,
        );
        audit(db, id, "create", "users", id);
        reply.code(201);
        return session(
          reply,
          publicUser(db.prepare("SELECT * FROM users WHERE id=?").get(id)!),
        );
      });
    },
  );
  app.post(
    "/api/v1/auth/login",
    {
      config: publicConfig,
      schema: {
        tags: ["Auth"],
        summary: "Authenticate using a session cookie",
        body: jsonSchema(loginSchema),
      },
    },
    async (req, reply) => {
      const body = loginSchema.parse(req.body),
        row = db.prepare("SELECT * FROM users WHERE email=?").get(body.email);
      const valid = await verify(body.password, String(row?.password || dummy));
      const current =
        row && db.prepare("SELECT * FROM users WHERE id=?").get(row.id);
      assert(
        valid && current?.active && current.password === row!.password,
        "invalidCredentials",
        401,
      );
      audit(db, Number(current.id), "login", "users", Number(current.id));
      return session(reply, publicUser(current));
    },
  );
  app.post(
    "/api/v1/auth/logout",
    { schema: { tags: ["Auth"], summary: "Revoke current session" } },
    async (req, reply) => {
      db.prepare("DELETE FROM sessions WHERE token=?").run(req.sessionToken!);
      reply.clearCookie("mekan_session", { path: "/" });
      return { ok: true };
    },
  );
  app.post(
    "/api/v1/auth/password",
    {
      schema: {
        tags: ["Auth"],
        summary: "Change password and revoke other sessions",
        body: jsonSchema(changePasswordSchema),
      },
    },
    async (req, reply) => {
      const body = changePasswordSchema.parse(req.body),
        row = db
          .prepare("SELECT * FROM users WHERE id=?")
          .get(req.account!.id)!;
      assert(
        await verify(body.currentPassword, String(row.password)),
        "invalidCredentials",
        401,
      );
      const password = await passwordHash(body.newPassword);
      return transaction(db, () => {
        const updated = db
          .prepare(
            "UPDATE users SET password=?,version=version+1 WHERE id=? AND password=? AND active=1",
          )
          .run(password, row.id, row.password);
        assert(updated.changes === 1, "conflict", 409);
        db.prepare("DELETE FROM sessions WHERE userId=?").run(row.id);
        audit(db, Number(row.id), "password", "users", Number(row.id));
        return session(
          reply,
          publicUser(db.prepare("SELECT * FROM users WHERE id=?").get(row.id)!),
        );
      });
    },
  );
  app.get(
    "/api/v1/users",
    {
      preHandler: requireAdmin,
      schema: {
        tags: ["Team"],
        summary: "List staff (administrator)",
        querystring: jsonSchema(listQuerySchema),
      },
    },
    async (req) => {
      const q = listQuerySchema.parse(req.query),
        term = "%" + q.q.replace(/[\\%_]/g, "\\$&") + "%";
      const where =
        "WHERE casefold(name) LIKE casefold(?) ESCAPE '\\' OR casefold(email) LIKE casefold(?) ESCAPE '\\'";
      const total = Number(
        db.prepare(`SELECT COUNT(*) n FROM users ${where}`).get(term, term)!.n,
      );
      const items = db
        .prepare(
          `SELECT * FROM users ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
        )
        .all(term, term, q.pageSize, (q.page - 1) * q.pageSize)
        .map(publicUser);
      return {
        items,
        total,
        page: q.page,
        pageSize: q.pageSize,
        pages: Math.ceil(total / q.pageSize),
      };
    },
  );
  app.post(
    "/api/v1/users",
    {
      preHandler: requireAdmin,
      schema: {
        tags: ["Team"],
        summary: "Create staff account",
        body: jsonSchema(userSchema),
      },
    },
    async (req, reply) => {
      const body = userSchema.parse(req.body),
        password = await passwordHash(body.password);
      return transaction(db, () => {
        assert(
          !db.prepare("SELECT id FROM users WHERE email=?").get(body.email),
          "emailExists",
          409,
        );
        const id = Number(
          db
            .prepare(
              "INSERT INTO users(name,email,password,role,createdAt) VALUES(?,?,?,?,?)",
            )
            .run(
              body.name,
              body.email,
              password,
              body.role,
              new Date().toISOString(),
            ).lastInsertRowid,
        );
        audit(db, req.account!.id, "create", "users", id);
        reply.code(201);
        return publicUser(
          db.prepare("SELECT * FROM users WHERE id=?").get(id)!,
        );
      });
    },
  );
  app.put<{ Params: { id: number } }>(
    "/api/v1/users/:id",
    {
      preHandler: requireAdmin,
      schema: {
        tags: ["Team"],
        summary: "Update staff role or active status",
        params: jsonSchema(
          z.object({ id: z.coerce.number().int().positive() }),
        ),
        body: jsonSchema(userUpdateSchema),
      },
    },
    async (req) => {
      const id = Number(req.params.id),
        body = userUpdateSchema.parse(req.body);
      assert(
        id !== req.account!.id || (body.active && body.role === "admin"),
        "selfDeactivate",
        409,
      );
      return transaction(db, () => {
        const result = db
          .prepare(
            "UPDATE users SET name=?,role=?,active=?,version=version+1 WHERE id=? AND version=?",
          )
          .run(body.name, body.role, body.active ? 1 : 0, id, body.version);
        assert(result.changes === 1, "conflict", 409);
        db.prepare("DELETE FROM sessions WHERE userId=?").run(id);
        audit(db, req.account!.id, "update", "users", id);
        return publicUser(
          db.prepare("SELECT * FROM users WHERE id=?").get(id)!,
        );
      });
    },
  );
}
