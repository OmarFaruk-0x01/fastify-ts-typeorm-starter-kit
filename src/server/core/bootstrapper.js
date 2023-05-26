"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
function init() {
    const server = (0, fastify_1.default)({ logger: true });
    server.get("/health-check", () => ({ status: "ok" }));
    return server;
}
exports.default = { init };
