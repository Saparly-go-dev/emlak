import { loadConfig } from "./config.js";
import { createApp } from "./app.js";
const config = loadConfig();
const app = await createApp(config);
for (const signal of ["SIGTERM", "SIGINT"] as const)
  process.once(signal, async () => {
    await app.close();
    process.exit(0);
  });
try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exit(1);
}
