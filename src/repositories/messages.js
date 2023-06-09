const { isAxiosError } = require("axios");
const { api } = require("../bootstrap/api.js");
const { get } = require("./config.js");
const mime = require("mime-types");
const { parseString } = require("../utils/parsers.js");

const send = async (clientId, config) => {
  if (typeof config !== "object" || config === null) {
    return "messages.send.error.config.invalid";
  }
  if (!["text", "button", "image", "file", "location"].includes(config.type)) {
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
    case "image":
      return await sendImage(instance, config);
    case "file":
      return await sendFile(instance, config);
    case "location":
      return await sendLocation(instance, config);
  }
};

const sendText = async (instance, config) => {
  const headers = {
    "x-instance-id": instance.code,
    "x-instance-secret": instance.secret,
  };
  const data = {
    message: valueToString(config.message),
    quote_message_id: "",
  };
  const route = "chat/send-message/" + valueToString(config.number);
  console.log("sending data to", route);
  try {
    const res = await api.post(route, data, { headers });
    if (typeof res.data === "object" && res.data !== null) {
      return res.data;
    }
  } catch (error) {
    if (isAxiosError(error)) {
      console.log(
        error.response.statusText + "(" + error.response.status + ")",
        error.response.data
      );
    } else {
      console.log("Internal error", error);
    }
  }
  return "message.text.send.error.api.internal";
};

const sendImage = async (instance, config) => {
  if (typeof config.image !== "string" || config.image === "") {
    return "message.image.send.error.image.invalid";
  }
  const headers = {
    "x-instance-id": instance.code,
    "x-instance-secret": instance.secret,
  };
  const data = {
    image: config.image,
    caption: typeof config.caption === "string" ? config.caption : "",
  };
  const route = "chat/send-image/" + valueToString(config.number);
  try {
    const res = await api.post(route, data, { headers });
    if (typeof res.data === "object" && res.data !== null) {
      return res.data;
    }
  } catch (error) {
    //
    console.log(error);
  }
  return "message.image.send.error.api.internal";
};

const sendFile = async (instance, config) => {
  if (typeof config.file !== "string" || config.file === "") {
    return "message.location.send.error.file.invalid";
  }
  const headers = {
    "x-instance-id": instance.code,
    "x-instance-secret": instance.secret,
  };
  const data = {
    file: config.file,
    mime: mime.lookup(config.file),
    caption: typeof config.caption === "string" ? config.caption : "",
  };
  const route = "chat/send-file/" + valueToString(config.number);
  try {
    const res = await api.post(route, data, { headers });
    if (typeof res.data === "object" && res.data !== null) {
      return res.data;
    }
  } catch (error) {
    //
    console.log(error);
  }
  return "message.file.send.error.api.internal";
};

const sendLocation = async (instance, config) => {
  const headers = {
    "x-instance-id": instance.code,
    "x-instance-secret": instance.secret,
  };
  const data = {
    lat: parseString(config.lat),
    lng: parseString(config.lng),
  };
  const route = "chat/send-location/" + valueToString(config.number);
  try {
    const res = await api.post(route, data, { headers });
    if (typeof res.data === "object" && res.data !== null) {
      return res.data;
    }
  } catch (error) {
    //
    console.log(error);
  }
  return "message.location.send.error.api.internal";
};

const sendButtons = async (instance, config) => {
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
  const headers = {
    "x-instance-id": instance.code,
    "x-instance-secret": instance.secret,
  };
  const data = {
    title,
    footer,
    message,
    buttons,
  };
  const route = "chat/send-buttons/" + valueToString(config.number);
  try {
    const res = await api.post(route, data, { headers });
    if (typeof res.data === "object" && res.data !== null) {
      return res.data;
    }
  } catch (error) {
    //
    console.log(error);
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

module.exports = {
  send,
  sendText,
  sendButtons,
  sendImage,
  sendFile,
  sendLocation,
};
