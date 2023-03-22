const { middlewares } = require("../router.js");
const { db } = require("../bootstrap/db.js");
const config = require("../config");

middlewares.before.unnamed.push(async (req, res, call) => {
  if (call.route === "webhook" && call.method === "all") {
    return;
  }
  let client_id = 0;
  let api_key = null;
  for (const current of [req.headers, req.body, req.query]) {
    if (typeof current === "object" && current !== null) {
      if (
        !api_key &&
        typeof current.api_key === "string" &&
        current.api_key.trim() !== ""
      ) {
        api_key = current.api_key.trim();
      }
      if (!client_id) {
        let tmp = "";
        if (typeof current.client_id === "number") {
          tmp = current.client_id.toString();
        } else if (typeof current.client_id === "string") {
          tmp = current.client_id.trim();
        }
        tmp = parseInt(tmp);
        if (!isNaN(tmp)) {
          client_id = tmp;
        }
      }
    }
  }
  //Cheking for api_key header if app is under production.
  const isAllowed =
    config.dev.status !== true ||
    typeof config.key !== "string" ||
    config.key === "" ||
    config.key === api_key;
  if (isAllowed && client_id > 0) {
    const client = await db("clientes").where("id", client_id).first();
    if (client) {
      req.client = client;
      return;
    }
  }
  res.status(403).json({
    status: false,
    message: "You cant access to this resource.",
  });
});
