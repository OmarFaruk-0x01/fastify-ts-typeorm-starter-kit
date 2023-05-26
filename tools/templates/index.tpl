/**
 * @module {{resource.name}}
 *
 * @description
 * All the exportable files and functions should be added here.
 * This file exposes the portions of this module. Routes and endpoint
 * should be exposed by default. Apart from routes, anything else should
 * not be exposed unless needed otherwise.
 */
import config from "./config";
import route from "./route";

export default {
  config,
  router: route.getRouter(),
};
