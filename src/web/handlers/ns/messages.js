const {
  sendText,
  sendButtons,
  sendImage,
  sendFile,
  sendLocation,
} = require("../../../repositories/messages.js");
const { get: cfg } = require("../../../repositories/config.js");
const {
  parsePhone,
  parseString,
  injectVars,
  parseObject,
  parseArray,
} = require("../../../utils/parsers");
const { db } = require("../../../bootstrap/db.js");

const sendMessages = async (
  clientId,
  templateName,
  number,
  vars,
  defaultInstance
) => {
  let templates = await cfg(`templates.${templateName}.messages`, clientId);

  if (typeof templates === "object" && templates !== null) {
    templates = [templates];
  }
  if (!Array.isArray(templates)) {
    return "ns.messages.error.template.invalid";
  }
  const responses = [];
  for (const index in templates) {
    const i = parseInt(index);
    const template = templates[i];
    if (typeof template !== "object" || template === null) {
      responses.push(`ns.messages.error.template.${i}.invalid`);
      continue;
    }
    let templateInstance = parseString(template.instance);
    let instance = null;
    if (templateInstance !== "") {
      const id = await cfg("instance." + templateInstance, clientId);
      if (id > 0) {
        instance = await db("wsapi_instances").where("id", current).first();
      }
    }
    if (!instance) {
      if (!defaultInstance) {
        responses.push(`ns.messages.error.template.${i}.instance.not_found`);
        continue;
      }
      instance = defaultInstance;
    }
    const message = injectVars(template.message, vars);
    if (template.type === "text") {
      responses.push(
        await sendText(instance, {
          number,
          message,
        })
      );
    } else if (template.type === "image") {
      const caption = injectVars(template.caption, vars);
      const image = injectVars(template.image, vars);
      responses.push(
        await sendImage(instance, {
          number,
          caption: caption === "" && message !== "" ? message : caption,
          image,
        })
      );
    } else if (template.type === "file") {
      const caption = injectVars(template.caption, vars);
      const file = injectVars(template.file, vars);
      responses.push(
        await sendFile(instance, {
          number,
          caption: caption === "" && message !== "" ? message : caption,
          file,
        })
      );
    } else if (template.type === "location") {
      const lat = injectVars(template.lat, vars);
      const lng = injectVars(template.lng, vars);
      responses.push(
        await sendLocation(instance, {
          number,
          lat,
          lng,
        })
      );
    } else if (template.type === "buttons") {
      const title = injectVars(template.title, vars);
      const footer = injectVars(template.footer, vars);
      const buttons = parseArray(template.buttons);
      const toDelete = [];
      for (const btnIndex in buttons) {
        const bi = parseInt(btnIndex);
        const raw = buttons[bi];
        if (typeof raw !== "object" || raw === null) {
          toDelete.push(bi);
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
      responses.push(
        await sendButtons(instance, {
          number,
          title,
          message,
          footer,
          buttons,
        })
      );
    } else {
      responses.push(`ns.messages.error.template.${i}.type.invalid`);
    }
  }
  return responses;
};

const postAction = async (req, res) => {
  let number = parsePhone(req.input("number"));
  let templateName = parseString(req.input("template"));
  let vars = parseObject(req.input("vars"));
  let clientId = req.client.id;
  let instanceId = parseInt(req.input("instance"));
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
  let instance = null;
  //Looking instance from direct instance parameter.
  if (instanceId > 0) {
    instance = await db("wsapi_instances").where("id", instanceId).first();
  }
  //Looking instance from template.{name}.instances.default and clients.instances.default.
  if (!instance) {
    for (const cfgKey of [
      `templates.${templateName}.instances.default`,
      `clients.instances.default`,
    ]) {
      const id = parseInt(await cfg(cfgKey, clientId));
      if (id > 0) {
        instance = await db("wsapi_instances").where("id", id).first();
        if (instance) {
          break;
        }
      }
    }
  }
  //Looking for first client instance and first main instance (of client 1).
  if (!instance) {
    const lookup = [];
    if (clientId !== 1) {
      lookup.unshift(clientId);
    }
    for (const id of lookup) {
      instance = await db("wsapi_instances").where("client_id", id).first();
      if (instance) {
        break;
      }
    }
  }
  //Send a response with messages status.
  res.status(200).json({
    status: true,
    data: await sendMessages(clientId, templateName, number, vars, instance),
  });
};
module.exports = { postAction };
