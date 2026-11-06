import { spawn } from "node:child_process";
const children = ["@mekan/api", "@mekan/web"].map((name) =>
  spawn("npm", ["run", "dev", "-w", name], {
    stdio: "inherit",
    env: {
      ...process.env,
      APP_ORIGIN: process.env.APP_ORIGIN || "http://127.0.0.1:5173",
      INIT_CWD: process.cwd(),
    },
  }),
);
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  process.exitCode = code;
}
children.forEach((child) => child.on("exit", (code) => stop(code || 0)));
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
