"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const source = new typeorm_1.DataSource({
    type: "postgres",
    // host: "localhost",
    // port: 5432,
    // username: "postgres",
    // password: "123123",
    // database: "test",
    entities: [(0, path_1.join)(__dirname, "../api/**/model.ts")],
    synchronize: true,
    logging: false,
});
function connect(config) {
    source.setOptions({ url: config.DB_URL });
    return source.initialize();
}
exports.default = { connect, dbSource: source };
