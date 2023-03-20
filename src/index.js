import "./router.js";
import "./web/middlewares.js";
import { server } from "./bootstrap/server.js";
import log from "./utils/log.js";
import config from "./config.js";
log("src-index", "start");
if (config.dev.status) {
  server.listen(config.dev.port, () => {
    console.log("Server started at " + config.dev.port);
  });
} else {
  server.listen();
}
