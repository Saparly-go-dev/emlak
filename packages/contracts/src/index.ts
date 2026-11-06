import { z } from "zod";
export const entityNames = [
  "properties",
  "clients",
  "deals",
  "viewings",
] as const;
export type Entity = (typeof entityNames)[number];
export const propertyTypes = [
  "apartment",
  "house",
  "office",
  "commercial",
  "land",
] as const;
export const statuses = {
  properties: ["available", "reserved", "closed"],
  clients: ["new", "contacted", "viewed", "negotiating", "won", "lost"],
  deals: ["new", "viewed", "negotiating", "documents", "won", "lost"],
  viewings: ["scheduled", "done", "cancelled"],
} as const;
const text = (max: number) => z.string().trim().min(1).max(max);
const optional = (max: number) => z.string().trim().max(max).default("");
const money = z
  .number()
  .positive()
  .max(1e12)
  .refine(
    (n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.01,
    "Two decimal places maximum",
  );
const common = {
  type: z.enum(propertyTypes),
  dealType: z.enum(["sale", "rent"]),
  currency: z.enum(["TMT", "USD"]),
  rentPeriod: z.enum(["month", "day"]),
  rooms: z.number().int().min(0).max(100),
  notes: optional(5000),
};
export const propertySchema = z
  .object({
    ...common,
    title: text(200),
    address: text(300),
    district: text(120),
    price: money,
    area: z.number().positive().max(1e8),
    owner: optional(160),
    phone: optional(40),
    status: z.enum(statuses.properties),
  })
  .strict();
export const clientSchema = z
  .object({
    ...common,
    name: text(160),
    phone: text(40),
    email: z.union([z.email().max(254), z.literal("")]).default(""),
    district: optional(120),
    budgetMax: money,
    minArea: z.number().min(0).max(1e8),
    status: z.enum(statuses.clients),
  })
  .strict();
const linked = {
  propertyId: z.number().int().positive(),
  clientId: z.number().int().positive(),
  notes: optional(5000),
};
export const dealSchema = z
  .object({ ...linked, amount: money, stage: z.enum(statuses.deals) })
  .strict();
export const viewingSchema = z
  .object({
    ...linked,
    startsAt: z.iso.datetime(),
    status: z.enum(statuses.viewings),
  })
  .strict();
export const schemas = {
  properties: propertySchema,
  clients: clientSchema,
  deals: dealSchema,
  viewings: viewingSchema,
};
export const loginSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  password: z.string().min(1).max(128),
});
export const setupSchema = loginSchema.extend({
  name: text(160),
  password: z.string().min(10).max(128),
});
export const userSchema = setupSchema.extend({
  role: z.enum(["admin", "agent"]),
});
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(10).max(128),
});
export const userUpdateSchema = z.object({
  name: text(160),
  role: z.enum(["admin", "agent"]),
  active: z.boolean(),
  version: z.number().int().positive(),
});
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(200).default(""),
  status: z.string().max(30).default(""),
  dealType: z.enum(["sale", "rent", ""]).default(""),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});
export type ListQuery = z.infer<typeof listQuerySchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type ViewingInput = z.infer<typeof viewingSchema>;
export interface Meta {
  id: number;
  version: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}
export type Property = PropertyInput & Meta;
export type Client = ClientInput & Meta;
export type Deal = DealInput &
  Meta & {
    currency: "TMT" | "USD";
    propertyTitle?: string;
    clientName?: string;
  };
export type Viewing = ViewingInput &
  Meta & { propertyTitle?: string; clientName?: string };
export type Records = {
  properties: Property;
  clients: Client;
  deals: Deal;
  viewings: Viewing;
};
export type CRMRecord = Records[Entity];
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent";
  active: boolean;
  version: number;
}
export interface Session {
  user: User | null;
  csrf: string | null;
  setupRequired: boolean;
}
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}
export interface ApiErrorBody {
  error: { code: string; requestId: string; fields?: Record<string, string[]> };
}
export interface Match {
  property: Property;
  score: number;
  criteria: {
    key: "budget" | "district" | "rooms" | "area";
    weight: number;
    value: number;
    matched: boolean;
  }[];
}
export interface AuditEntry {
  id: number;
  actorName: string;
  action: string;
  entity: string;
  recordId: number;
  createdAt: string;
}
export interface Dashboard {
  counts: {
    properties: number;
    clients: number;
    deals: number;
    viewings: number;
  };
  stages: { stage: string; count: number }[];
  volume: { currency: string; amount: number }[];
  properties: Property[];
  viewings: Viewing[];
}

// Runtime output contracts also generate the OpenAPI response schemas.
export const metaSchema = z.object({
  id: z.number().int().positive(),
  version: z.number().int().positive(),
  createdBy: z.number().int().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const recordSchemas = {
  properties: propertySchema.extend(metaSchema.shape),
  clients: clientSchema.extend(metaSchema.shape),
  deals: dealSchema.extend({
    ...metaSchema.shape,
    currency: z.enum(["TMT", "USD"]),
    propertyTitle: z.string().optional(),
    clientName: z.string().optional(),
  }),
  viewings: viewingSchema.extend({
    ...metaSchema.shape,
    propertyTitle: z.string().optional(),
    clientName: z.string().optional(),
  }),
};
export const publicUserSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  role: z.enum(["admin", "agent"]),
  active: z.boolean(),
  version: z.number().int(),
});
export const sessionSchema = z.object({
  user: publicUserSchema.nullable(),
  csrf: z.string().nullable(),
  setupRequired: z.boolean(),
});
export const errorSchema = z.object({
  error: z.object({
    code: z.string(),
    requestId: z.string(),
    fields: z.record(z.string(), z.array(z.string())).optional(),
  }),
});
export const pageSchema = (item: z.ZodType) =>
  z.object({
    items: z.array(item),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    pages: z.number().int(),
  });
export const okSchema = z.object({ ok: z.literal(true) });
export const matchSchema = z.object({
  property: recordSchemas.properties,
  score: z.number(),
  criteria: z.array(
    z.object({
      key: z.enum(["budget", "district", "rooms", "area"]),
      weight: z.number(),
      value: z.number(),
      matched: z.boolean(),
    }),
  ),
});
export const auditSchema = z.object({
  id: z.number().int(),
  actorName: z.string(),
  action: z.string(),
  entity: z.string(),
  recordId: z.number().int(),
  createdAt: z.string(),
});
export const dashboardSchema = z.object({
  counts: z.object({
    properties: z.number(),
    clients: z.number(),
    deals: z.number(),
    viewings: z.number(),
  }),
  stages: z.array(z.object({ stage: z.string(), count: z.number() })),
  volume: z.array(z.object({ currency: z.string(), amount: z.number() })),
  properties: z.array(recordSchemas.properties),
  viewings: z.array(recordSchemas.viewings),
});
