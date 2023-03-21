const { api } = require("../bootstrap/api.js");
const { get } = require("./config.js");

const send = async (clientId, config) => {
  if (typeof config !== "object" || config === null) {
    return "messages.send.error.config.invalid";
  }
  if (!["text", "button"].includes(config.type)) {
    return "messages.send.error.config.type.invalid";
  }
  if (typeof config.number === "number") {
    config.number = config.number.toString();
  }
  config.number = parsePhone(config.number);
  if (config.number === "") {
    return "messages.send.error.config.number.invalid";
  }

  if (typeof clientId === "number") {
    clientId = clientId.toString();
  }
  clientId = parseInt(typeof clientId === "string" ? clientId.trim() : 0);
  if (isNaN(clientId) || clientId < 1) {
    return "message.send.error.forbidden";
  }
  const client = await db("clientes").where("id", clientId).first();
  if (!client) {
    return "message.send.error.forbidden";
  }
  config.instance =
    typeof config.instance === "string" ? config.instance.trim() : "";

  if (config.instance !== "") {
    config.instance = await get("default.instance." + config.instance);
  } else {
    config.instance = await get("default.instance");
  }
  let instanceId = config.instance;
  instanceId = parseInt(typeof instanceId === "string" ? instanceId.trim() : 0);
  if (isNaN(instanceId) && instanceId > 0) {
    return "message.send.instance.not_found";
  }
  const instance = await db("wsapi_instances").where("id", instanceId).first();
  if (!instance) {
    return "message.send.instance.not_found";
  }
  if (
    typeof instance.code !== "string" ||
    instance.code === "" ||
    typeof instance.secret !== "string" ||
    typeof instance.secret === ""
  ) {
    return "message.send.instance.invalid";
  }
  switch (config.type) {
    case "text":
      return await sendText(instance, config);
    case "button":
      return await sendButtons(instance, config);
  }
};

export const sendText = async (instance, config) => {
  const message = valueToString(config.value);
  try {
    const res = await api.post(
      "chat/send-message/".config.number,
      {
        message,
        quote_message_id: "",
      },
      {
        "x-instance-id": instance.code,
        "x-instance-secret": instance.secret,
      }
    );
    if (typeof res.data === "object" && res.data !== null) {
      return res.data;
    }
  } catch (error) {
    //
  }
  return "message.text.send.error.api.internal";
};

export const sendButtons = async (instance, config) => {
  const title = valueToString(config.title);
  const footer = valueToString(config.footer);
  const message = valueToString(config.message);
  const buttons = [];

  if (Array.isArray(config.buttons)) {
    for (const index in config.buttons) {
      const i = parseInt(index);
      const defaultID = i + 1;
      const current = config.buttons[i];

      if (typeof current === "object" && current !== null) {
        const button = {
          body: valueToString(current.body),
        };
        if (typeof current.id === "number") {
          current.id = current.id.toString();
        }
        const url = typeof current.url === "string" ? current.url.trim() : "";
        const number = parsePhone(current.number);
        let id =
          typeof current.id === "string" ? parseInt(current.id.trim()) : 0;
        if (id < 1) {
          id = defaultID;
        }
        if (url !== "") {
          button.url = url;
        } else if (number !== "") {
          button.number = number;
        } else {
          button.id = id;
        }
        buttons.push(button);
      }
    }
  }

  if (buttons.length < 1) {
    return "message.buttons.send.error.buttons.invalid";
  }

  try {
    const res = await api.post(
      "chat/send-buttons/".config.number,
      {
        title,
        footer,
        message,
        buttons,
      },
      {
        "x-instance-id": instance.code,
        "x-instance-secret": instance.secret,
      }
    );
    if (typeof res.data === "object" && res.data !== null) {
      return res.data;
    }
  } catch (error) {
    //
  }
  return "message.text.send.error.api.internal";
};

const valueToString = (value) => {
  if (value === null) {
    value = "";
  } else if (value === undefined) {
    value = "";
  } else if (typeof value === "number") {
    value = value.toString();
  } else if (typeof value === "boolean") {
    value = value === true ? "true" : "false";
  } else if (typeof value === "object" || Array.isArray(value)) {
    value = JSON.stringify(value);
  }
  return typeof value === "string" ? value.trim() : "";
};

const parsePhone = (value) => {
  if (typeof value === "number") {
    value = value.toString();
  }
  return typeof value === "string" ? value.trim().replace(/\D/g, "") : "";
};
module.exports = { send };
