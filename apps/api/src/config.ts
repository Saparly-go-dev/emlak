import { z } from "zod";
import { resolve } from "node:path";
const envSchema = z.object({
  PORT: z.coerce.number().int().min(0).max(65535).default(3000),
  HOST: z.string().default("127.0.0.1"),
  DB_PATH: z.string().default("data/mekan.sqlite"),
  APP_ORIGIN: z.url().default("http://127.0.0.1:3000"),
  COOKIE_SECURE: z.enum(["0", "1"]).default("0"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["silent", "fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});
export type Config = {
  port: number;
  host: string;
  dbPath: string;
  origin: string;
  secure: boolean;
  production: boolean;
  logLevel: string;
  webRoot: string;
};
export function loadConfig(): Config {
  const e = envSchema.parse(process.env);
  const root =
    process.env.INIT_CWD ||
    (process.cwd().endsWith("/apps/api") ? resolve("../..") : process.cwd());
  return {
    port: e.PORT,
    host: e.HOST,
    dbPath: resolve(root, e.DB_PATH),
    origin: new URL(e.APP_ORIGIN).origin,
    secure: e.COOKIE_SECURE === "1",
    production: e.NODE_ENV === "production",
    logLevel: e.LOG_LEVEL,
    webRoot: resolve(root, "apps/web/dist"),
  };
}
