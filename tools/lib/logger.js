// const chalk = require('chalk');

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

module.exports = {
  debug,
  error,
};
