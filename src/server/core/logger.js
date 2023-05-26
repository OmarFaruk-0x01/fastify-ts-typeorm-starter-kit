"use strict";
// import chalk from "chalk";
Object.defineProperty(exports, "__esModule", { value: true });
function debug(message, ...args) {
    console.log("\n");
    console.log(`[DEBUG]: `, message, ...args);
    console.log("\n");
}
function error(message, ...args) {
    console.log("\n");
    console.log(`[ERROR]: `, message, ...args);
    console.log("\n");
}
exports.default = { debug, error };
