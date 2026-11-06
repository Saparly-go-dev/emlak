import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  recordSchemas,
  sessionSchema,
  publicUserSchema,
  pageSchema,
  errorSchema,
  okSchema,
  matchSchema,
  dashboardSchema,
  auditSchema,
  type Entity,
} from "@mekan/contracts";
import { jsonSchema } from "./modules/auth.js";
export function documentResponses(app: FastifyInstance) {
  app.addHook("onRoute", (route) => {
    if (!route.url.startsWith("/api/v1")) return;
    const method = Array.isArray(route.method) ? route.method[0] : route.method;
    const path = route.url.slice("/api/v1".length);
    let result: z.ZodType = okSchema;
    let status = 200;
    if (path.startsWith("/auth/") && path !== "/auth/logout")
      result = sessionSchema;
    if (path === "/auth/setup") status = 201;
    const entity = path.split("/")[1] as Entity;
    if (entity in recordSchemas) {
      result =
        method === "DELETE"
          ? okSchema
          : method === "GET" && !path.includes("/:id")
            ? pageSchema(recordSchemas[entity])
            : recordSchemas[entity];
      if (method === "POST") status = 201;
    }
    if (path.endsWith("/recommendations")) result = z.array(matchSchema);
    if (path === "/users" || path === "/users/:id") {
      result =
        method === "GET" ? pageSchema(publicUserSchema) : publicUserSchema;
      if (method === "POST") status = 201;
    }
    if (path === "/dashboard") result = dashboardSchema;
    if (path === "/audit") result = pageSchema(auditSchema);
    if (path === "/health") result = z.object({ status: z.literal("ok") });
    const errors = Object.fromEntries(
      [400, 401, 403, 404, 409, 413, 429, 500].map((code) => [
        code,
        jsonSchema(errorSchema),
      ]),
    );
    route.schema = {
      ...route.schema,
      response: { [status]: jsonSchema(result), ...errors },
      security: route.config?.public
        ? []
        : [method === "GET" ? { session: [] } : { session: [], csrf: [] }],
    };
  });
}
