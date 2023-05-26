import config from "./config";
import route from "./route";

export default {
  config,
  router: route.getRouter(),
};
