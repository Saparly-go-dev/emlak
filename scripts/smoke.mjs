// Exercise the actual compiled server and SPA assets on an ephemeral port/database.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import assert from "node:assert/strict";
const directory = mkdtempSync(join(tmpdir(), "mekan-production-"));
const child = spawn(process.execPath, ["apps/api/dist/index.js"], {
  env: {
    ...process.env,
    PORT: "0",
    HOST: "127.0.0.1",
    DB_PATH: join(directory, "test.sqlite"),
    LOG_LEVEL: "info",
    NODE_ENV: "production",
    COOKIE_SECURE: "0",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let errors = "";
child.stderr.on("data", (data) => (errors += data));
try {
  const base = await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(
      () => reject(Error("Startup timeout: " + errors)),
      10000,
    );
    child.stdout.on("data", (data) => {
      output += data;
      const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) {
        clearTimeout(timer);
        resolve(match[0]);
      }
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(Error("Server exited: " + code + " " + errors));
    });
  });
  const root = await fetch(base + "/");
  assert.equal(root.status, 200);
  const html = await root.text();
  assert.match(html, /id="root"/);
  const script = html.match(/src="([^\"]+\.js)"/)?.[1];
  assert.ok(script);
  assert.equal((await fetch(base + script)).status, 200);
  assert.equal((await fetch(base + "/properties")).status, 200);
  assert.equal((await fetch(base + "/api/v1/health")).status, 200);
  assert.equal((await fetch(base + "/api/v1/properties")).status, 401);
  const spec = await (await fetch(base + "/docs/json")).json();
  assert.ok(spec.paths["/api/v1/properties"].get.responses["200"]);
  const docs = await fetch(base + "/docs/");
  assert.equal(docs.status, 200);
  assert.match(await docs.text(), /swagger-ui/);
  console.log(
    "Production smoke passed: SPA, assets, deep links, API authorization, health, OpenAPI and Swagger UI.",
  );
} finally {
  if (child.exitCode === null) {
    const exited = once(child, "exit");
    child.kill("SIGTERM");
    await exited;
  }
  rmSync(directory, { recursive: true, force: true });
}
