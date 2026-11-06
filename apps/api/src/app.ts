import Fastify from "fastify";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import staticFiles from "@fastify/static";
import { existsSync } from "node:fs";
import { z } from "zod";
import type { Config } from "./config.js";
import { openDatabase } from "./database.js";
import { AppError } from "./errors.js";
import { authModule } from "./modules/auth.js";
import { crmModule } from "./modules/crm.js";
import { documentResponses } from "./openapi.js";
export async function createApp(config: Config) {
  const db = openDatabase(config.dbPath);
  const app = Fastify({
    logger:
      config.logLevel === "silent"
        ? false
        : {
            level: config.logLevel,
            redact: [
              "req.headers.cookie",
              "req.headers.authorization",
              'req.headers["x-csrf-token"]',
              'res.headers["set-cookie"]',
            ],
          },
    bodyLimit: 65536,
    requestTimeout: 15000,
    ajv: { customOptions: { removeAdditional: false } },
  });
  app.addHook("onClose", async () => db.close());
  app.setErrorHandler((error, req, reply) => {
    let code = "serverError",
      status = 500,
      fields: Record<string, string[]> | undefined;
    if (error instanceof AppError) {
      code = error.code;
      status = error.statusCode;
      fields = error.fields;
    } else if (error instanceof z.ZodError) {
      code = "validation";
      status = 400;
      fields = z.flattenError(error).fieldErrors as Record<string, string[]>;
    } else if ((error as { validation?: unknown }).validation) {
      code = "validation";
      status = 400;
    } else if ((error as { statusCode?: number }).statusCode === 429) {
      code = "tooManyAttempts";
      status = 429;
    } else if ((error as { statusCode?: number }).statusCode === 413) {
      code = "tooLarge";
      status = 413;
    } else if (
      (error as { statusCode?: number }).statusCode &&
      Number((error as { statusCode: number }).statusCode) < 500
    ) {
      code = "validation";
      status = Number((error as { statusCode: number }).statusCode);
    }
    if (status >= 500) req.log.error({ err: error }, "Request failed");
    reply.code(status).send({
      error: { code, requestId: req.id, ...(fields ? { fields } : {}) },
    });
  });
  await app.register(cookie);
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: "1 minute",
  });
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Mekan CRM API",
        version: "2.0.0",
        description:
          "Real estate and client management. Writes require the session cookie and X-CSRF-Token from /api/v1/auth/session. PUT includes version; DELETE requires If-Match.",
      },
      components: {
        securitySchemes: {
          session: { type: "apiKey", in: "cookie", name: "mekan_session" },
          csrf: { type: "apiKey", in: "header", name: "X-CSRF-Token" },
        },
      },
    },
  });
  await app.register(swaggerUI, { routePrefix: "/docs", staticCSP: true });
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", ...app.swaggerCSP.script],
        styleSrc: ["'self'", ...app.swaggerCSP.style],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: config.secure ? [] : null,
      },
    },
    strictTransportSecurity: config.secure ? undefined : false,
  });
  documentResponses(app);
  await authModule(app, db, config);
  app.get(
    "/api/v1/health",
    {
      config: { public: true },
      schema: { tags: ["System"], summary: "Database readiness" },
    },
    async () => {
      db.prepare("SELECT 1").get();
      return { status: "ok" };
    },
  );
  await crmModule(app, db);
  if (existsSync(config.webRoot))
    await app.register(staticFiles, { root: config.webRoot, wildcard: false });
  app.setNotFoundHandler((req, reply) => {
    if (
      req.method === "GET" &&
      !req.url.startsWith("/api/") &&
      !req.url.startsWith("/docs") &&
      existsSync(config.webRoot)
    )
      return reply.sendFile("index.html");
    return reply
      .code(404)
      .send({ error: { code: "notFound", requestId: req.id } });
  });
  return app;
}
