require("./router.js");
require("./web/middlewares.js");
const { server } = require("./bootstrap/server.js");
const { write: log } = require("./utils/log.js");
const config = require("./config.json");
log("src-index", "start");
if (config.dev.status) {
  server.listen(config.dev.port, () => {
    console.log("Server started at " + config.dev.port);
  });
} else {
  server.listen();
}
