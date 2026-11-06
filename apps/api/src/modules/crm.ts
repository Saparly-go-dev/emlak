import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  entityNames,
  schemas,
  listQuerySchema,
  type Property,
  type Client,
  type Entity,
} from "@mekan/contracts";
import { jsonSchema, requireAdmin } from "./auth.js";
import { type DB, transaction, audit } from "../database.js";
import { find, list, write, decode } from "../repository.js";
import { assert, AppError } from "../errors.js";
import { recommend } from "./matching.js";
const params = z.object({ id: z.coerce.number().int().positive() });
const defaultQuery = listQuerySchema.parse({});
function validateLinks(
  db: DB,
  table: Entity,
  data: Record<string, unknown>,
  id?: number,
) {
  if (table !== "deals" && table !== "viewings") return;
  const property = find(db, "properties", Number(data.propertyId)),
    client = find(db, "clients", Number(data.clientId));
  if (table === "deals") {
    assert(
      property.dealType === client.dealType &&
        property.currency === client.currency &&
        (property.dealType !== "rent" ||
          property.rentPeriod === client.rentPeriod),
      "incompatible",
    );
    data.currency = property.currency;
  }
  if (table === "viewings" && data.status === "scheduled") {
    const time = Date.parse(String(data.startsAt));
    assert(
      !db
        .prepare(
          "SELECT id FROM viewings WHERE id!=? AND status='scheduled' AND (propertyId=? OR clientId=?) AND startsAt>? AND startsAt<?",
        )
        .get(
          id || 0,
          Number(data.propertyId),
          Number(data.clientId),
          new Date(time - 3600000).toISOString(),
          new Date(time + 3600000).toISOString(),
        ),
      "scheduleConflict",
      409,
    );
    data.startsAt = new Date(time).toISOString();
  }
}
export async function crmModule(app: FastifyInstance, db: DB) {
  for (const table of entityNames) {
    const path = `/api/v1/${table}`,
      schema = schemas[table],
      tag = table;
    app.get(
      path,
      {
        schema: {
          tags: [tag],
          summary: `Search and paginate ${table}`,
          querystring: jsonSchema(listQuerySchema),
        },
      },
      async (req) => list(db, table, listQuerySchema.parse(req.query)),
    );
    app.get<{ Params: { id: number } }>(
      `${path}/:id`,
      {
        schema: {
          tags: [tag],
          summary: `Read ${table} record`,
          params: jsonSchema(params),
        },
      },
      async (req) => find(db, table, Number(req.params.id)),
    );
    app.post(
      path,
      {
        schema: {
          tags: [tag],
          summary: `Create ${table} record`,
          body: jsonSchema(schema),
        },
      },
      async (req, reply) => {
        const data = schema.parse(req.body) as Record<string, unknown>;
        return transaction(db, () => {
          validateLinks(db, table, data);
          const result = write(db, table, data, req.account!.id);
          audit(db, req.account!.id, "create", table, result.id);
          reply.code(201);
          return result;
        });
      },
    );
    const update = schema.extend({ version: z.number().int().positive() });
    app.put<{ Params: { id: number } }>(
      `${path}/:id`,
      {
        schema: {
          tags: [tag],
          summary: `Update ${table} with optimistic concurrency`,
          params: jsonSchema(params),
          body: jsonSchema(update),
        },
      },
      async (req) => {
        const { version, ...data } = update.parse(req.body),
          id = Number(req.params.id);
        return transaction(db, () => {
          find(db, table, id);
          validateLinks(db, table, data, id);
          const result = write(db, table, data, req.account!.id, id, version);
          audit(db, req.account!.id, "update", table, id);
          return result;
        });
      },
    );
    app.delete<{ Params: { id: number } }>(
      `${path}/:id`,
      {
        preHandler: requireAdmin,
        schema: {
          tags: [tag],
          summary: `Delete unreferenced ${table} record (administrator)`,
          params: jsonSchema(params),
          headers: {
            type: "object",
            required: ["if-match"],
            properties: {
              "if-match": { type: "string", pattern: "^[1-9][0-9]*$" },
            },
          },
        },
      },
      async (req) => {
        const id = Number(req.params.id),
          version = Number(req.headers["if-match"]);
        return transaction(db, () => {
          find(db, table, id);
          try {
            const result = db
              .prepare(`DELETE FROM ${table} WHERE id=? AND version=?`)
              .run(id, version);
            assert(result.changes === 1, "conflict", 409);
          } catch (error) {
            if (error instanceof Error && error.message.includes("FOREIGN KEY"))
              throw new AppError("inUse", 409);
            throw error;
          }
          audit(db, req.account!.id, "delete", table, id);
          return { ok: true };
        });
      },
    );
  }
  app.get<{ Params: { id: number } }>(
    "/api/v1/clients/:id/recommendations",
    {
      schema: {
        tags: ["Intelligence"],
        summary: "Explainable recommendations for a client",
        params: jsonSchema(params),
      },
    },
    async (req) => {
      const client = find(db, "clients", Number(req.params.id));
      const properties = db
        .prepare(
          "SELECT * FROM properties WHERE status='available' AND type=? AND dealType=? AND currency=?",
        )
        .all(client.type, client.dealType, client.currency)
        .map((row) => decode<Property>(row));
      return recommend(client, properties);
    },
  );
  app.get(
    "/api/v1/dashboard",
    {
      schema: {
        tags: ["Analytics"],
        summary: "Agency overview and aggregated metrics",
      },
    },
    async () => {
      const count = (query: string) => Number(db.prepare(query).get()!.n);
      return {
        counts: {
          properties: count(
            "SELECT COUNT(*) n FROM properties WHERE status='available'",
          ),
          clients: count(
            "SELECT COUNT(*) n FROM clients WHERE status NOT IN ('won','lost')",
          ),
          deals: count(
            "SELECT COUNT(*) n FROM deals WHERE stage NOT IN ('won','lost')",
          ),
          viewings: Number(
            db
              .prepare(
                "SELECT COUNT(*) n FROM viewings WHERE status='scheduled' AND startsAt>=?",
              )
              .get(new Date().toISOString())!.n,
          ),
        },
        stages: db
          .prepare("SELECT stage,COUNT(*) count FROM deals GROUP BY stage")
          .all(),
        volume: db
          .prepare(
            "SELECT currency,SUM(amount)/100.0 amount FROM deals WHERE stage='won' GROUP BY currency",
          )
          .all(),
        properties: list(db, "properties", { ...defaultQuery, pageSize: 3 })
          .items,
        viewings: db
          .prepare(
            "SELECT v.*,p.title propertyTitle,c.name clientName FROM viewings v JOIN properties p ON v.propertyId=p.id JOIN clients c ON v.clientId=c.id WHERE v.status='scheduled' AND v.startsAt>=? ORDER BY startsAt LIMIT 4",
          )
          .all(new Date().toISOString()),
      };
    },
  );
  app.get(
    "/api/v1/audit",
    {
      preHandler: requireAdmin,
      schema: {
        tags: ["Audit"],
        summary: "Paginated audit log (administrator)",
        querystring: jsonSchema(listQuerySchema),
      },
    },
    async (req) => {
      const q = listQuerySchema.parse(req.query),
        total = Number(db.prepare("SELECT COUNT(*) n FROM audit").get()!.n);
      const items = db
        .prepare(
          "SELECT a.*,u.name actorName FROM audit a LEFT JOIN users u ON a.actorId=u.id ORDER BY a.id DESC LIMIT ? OFFSET ?",
        )
        .all(q.pageSize, (q.page - 1) * q.pageSize);
      return {
        items,
        total,
        page: q.page,
        pageSize: q.pageSize,
        pages: Math.ceil(total / q.pageSize),
      };
    },
  );
}
