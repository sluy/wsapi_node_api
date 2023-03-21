const { sendText, sendButtons } = require("../../../repositories/messages.js");
const { get } = require("../../../repositories/config.js");
const {
  parsePhone,
  parseString,
  injectVars,
  parseObject,
  parseArray,
} = require("../../../utils/parsers");
const { db } = require("../../../bootstrap/db.js");

const cfg = async (key, clientId, defaultValue) => {
  clientId = parseInt(clientId);
  const lookup = [1];
  if (clientId > 2) {
    tries.unshift(clientId);
  }
  for (const id of lookup) {
    const tmp = await get(key, clientId);
    if (typeof tmp === "object" && tmp !== null) {
      return tmp.value;
    }
  }
  return defaultValue;
};

const postAction = async (req, res) => {
  let number = parsePhone(req.input("number"));
  let templateName = parseString(req.input("template"));
  let instanceId = parseInt(req.input("instance"));
  let vars = parseObject(req.input("vars"));
  if (number === "") {
    res.status(422).json({
      status: false,
      message: "ns.messages.error.number.invalid",
      data: {
        number,
      },
    });
    return;
  }
  const template = await cfg(
    "messages.templates." + templateName,
    req.client.id
  );
  if (typeof template !== "object" || template === null) {
    res.status(422).json({
      status: false,
      message: "ns.messages.error.template.invalid",
    });
    return;
  }
  let instance = null;
  let templateInstance = parseString(template.instance);
  if (templateInstance) {
    const id = await cfg("instance." + templateInstance, req.client.id);
    if (id > 0) {
      instance = await db("wsapi_instances").where("id", current).first();
    }
  }
  if (!instance) {
    instance = await db("wsapi_instances").where("client_id", 1).first();
    if (!instance) {
      res.status(200).json({
        status: false,
        message: "ns.messages.error.instance.not_found",
      });
      return;
    }
  }
  let response = "ns.messages.error.template.type.invalid";
  const message = injectVars(template.message, vars);
  switch (template.type) {
    case "text":
      response = await sendText(instance, {
        number,
        message,
      });
      break;
    case "buttons":
      const title = injectVars(template.title, vars);
      const footer = injectVars(template.footer, vars);
      const buttons = parseArray(template.buttons);
      const toDelete = [];
      for (const index in buttons) {
        const i = parseInt(index);
        const raw = buttons[index];
        if (typeof raw !== "object" || raw === null) {
          toDelete.push(i);
          continue;
        }
        for (const key of ["id", "body", "url", "number"]) {
          if (key in raw) {
            raw[key] = injectVars(raw[key], vars);
          }
        }
      }
      for (const key of toDelete.reverse()) {
        buttons.splice(key, 1);
      }
      response = await sendButtons(instance, {
        number,
        title,
        message,
        footer,
        buttons,
      });
    default:
      break;
  }
  if (typeof response === "string") {
    res.status(500).json({
      status: false,
      message: response,
    });
    return;
  }
  res.status(200).json({
    status: true,
    data: response,
  });
};
module.exports = { postAction };
