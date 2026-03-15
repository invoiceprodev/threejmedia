import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import handler from "../api/[...path].js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.resolve(__dirname, "../.env");

function loadLocalEnv() {
  if (!existsSync(envFilePath)) {
    return;
  }

  const lines = readFileSync(envFilePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const port = Number(process.env.PORT || 3001);

const server = createServer(async (request, response) => {
  await handler(request, response);
});

server.listen(port, () => {
  console.log(`Three J Media API listening on port ${port}`);
});
