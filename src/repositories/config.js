const { db } = require("../bootstrap/db.js");

const get = async (key, clientId) => {
  if (key === "" || key === null || key === undefined) {
    return "config.get.key.required";
  }
  if (typeof key !== "string") {
    return "config.get.key.invalid";
  }

  key = key.trim();
  if (key === "") {
    return "config.get.key.required";
  }

  let model = await db("wsapi_config")
    .where("client_id", clientId)
    .where("key", key)
    .first();
  if (!model) {
    return "config.get.not_found";
  }
  let value = undefined;
  try {
    value = JSON.parse(model.value);
  } catch (error) {
    value = model.value;
  }
  return {
    key,
    value,
  };
};

const set = async (key, value, clientId) => {
  if (typeof key !== "string" || key.trim() === "") {
    return "config.set.key.invalid";
  }
  key = key.trim();
  const strVal = JSON.stringify(value);
  let model = await db("wsapi_config")
    .where("key", key)
    .where("client_id", clientId)
    .first();

  if (!model) {
    model = {
      client_id: req.client.id,
      key,
      value: strVal,
    };
  } else {
    model.value = strVal;
  }
  model.id
    ? await db("wsapi_config")
        .where("id", model.id)
        .update({ value: model.value })
    : await db("wsapi_config").insert({
        key,
        value: model.value,
      });
  return {
    key: model.key,
    value: model.value,
  };
};

module.exports = { get, set };
