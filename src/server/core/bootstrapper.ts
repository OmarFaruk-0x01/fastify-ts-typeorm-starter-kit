import Fastify from "fastify";

function init() {
  const server = Fastify({ logger: true });

  server.get("/health-check", () => ({ status: "ok" }));

  return server;
}

export default { init };
