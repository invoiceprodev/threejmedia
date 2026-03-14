import { spawn } from "node:child_process";

const children = [];
let isShuttingDown = false;

function startProcess(name, command, args) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  children.push(child);

  child.on("exit", (code, signal) => {
    if (isShuttingDown) {
      return;
    }

    console.error(`${name} exited ${signal ? `with signal ${signal}` : `with code ${code ?? 0}`}.`);
    shutdown(code ?? 1);
  });

  child.on("error", (error) => {
    if (isShuttingDown) {
      return;
    }

    console.error(`Failed to start ${name}:`, error);
    shutdown(1);
  });
}

function shutdown(exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
    }

    process.exit(exitCode);
  }, 1_000).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

startProcess("frontend", "npm", ["run", "dev"]);
startProcess("api", "npm", ["run", "dev:api:once"]);
