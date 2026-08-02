import app from "./app.js";
import { port } from "./config/environment.js";
import { closeDatabase } from "./db.js";
import { logger } from "./logger.js";

const server = app.listen(port, () => {
  logger.info({ port }, "Oxeno API running");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error({ err: error, port }, "API port is already in use");
    process.exit(1);
  }

  logger.error({ err: error }, "Server error");
  process.exit(1);
});

async function shutdown() {
  logger.info("Shutting down API server");
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  await closeDatabase();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
