import { middlewares } from "../router.js";
import { db } from "../bootstrap/db.js";

middlewares.before.unnamed.push(async (req, res, call) => {
  if (call.route === "webhook" && call.method === "all") {
    return;
  }
  let client_id = 0;
  for (const current of [req.headers, req.body, req.query]) {
    if (typeof current === "object" && current !== null) {
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
  if (client_id > 0) {
    const client = await db("clientes").where("id", client_id).first();
    if (client) {
      req.client = client;
      return;
    }
  }
  res.status(403).json({
    status: false,
    message: "You cant access.",
  });
});
