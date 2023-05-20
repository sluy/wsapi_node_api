const { io } = require("../../bootstrap/server.js");
const { db } = require("../../bootstrap/db.js");
const { write: log } = require("../../utils/log.js");

const makeRes = (data, res) => {
  res.json(data);
  return;
};

const allAction = async (req, res) => {
  const data =
    typeof req.body === "object" && req.body !== null ? req.body : {};
  data.instance_id =
    typeof data.instance_id === "string" ? data.instance_id.trim() : "";
  data.type = typeof data.type === "string" ? data.type.trim() : "";
  log("webhook", "start", data);
  if (data.instance_id === "" || data.type === "") {
    return makeRes(data, res);
  }
  data.instance = await db("wsapi_instances")
    .where("code", data.instance_id)
    .first();
  if (!data.instance) {
    return makeRes(data, res);
  }
  const client = await db("clientes")
    .where("id", data.instance.client_id)
    .first();
  if (!client) {
    return makeRes(data, res);
  }
  if (typeof data.data === "object" && data.data !== null) {
    if (
      data.type === "qr" &&
      typeof data.data.qrcode === "string" &&
      data.data.qrcode !== "" &&
      typeof data.data.base64 === "string" &&
      data.data.base64 !== ""
    ) {
      await db("wsapi_instances").where("id", data.instance.id).update({
        qr: data.data.qrcode,
      });
      data.instance.qr = data.data.qrcode;
    }
    if (data.type === "ready") {
      await db("wsapi_instances").where("id", data.instance.id).update({
        connected: 1,
      });
    }
    if (data.type === "disconnected") {
      await db('wsapi_instances').where('id', data.instance.id).update({
        connected: 0,
      });
    }
  }
  const eventName = client.id + ".wsapi.webhook." + data.type;
  io.emit(eventName, data);
  data.emit = eventName;
  const globalEventName = client.id + 'wsapi.webhook';
  //Emitimos el evento global (sólo {id}.wsapi.webhook).
  io.emit(globalEventName, data);
  
  log("webhook", "finish", data);
  return makeRes(data, res);
};

module.exports = { allAction };
