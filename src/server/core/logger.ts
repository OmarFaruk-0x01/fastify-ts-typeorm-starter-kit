// import chalk from "chalk";

function debug(message: any, ...args: any) {
  console.log("\n");
  console.log(`[DEBUG]: `, message, ...args);
  console.log("\n");
}

function error(message: any, ...args: any) {
  console.log("\n");
  console.log(`[ERROR]: `, message, ...args);
  console.log("\n");
}

export default { debug, error };
