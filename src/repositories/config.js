import { db } from "../../bootstrap/db.js";

export const get = async (key, clientId) => {
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
    model = { key, value: null };
  }
  if (key === "default.instance" || key.startsWith("default.instance")) {
    await resolveDefaultInstance(model, clientId);
  }
  if (!model.value) {
    return "config.get.not_found";
  }
  return {
    key,
    value: model.value,
  };
};

export const set = async (key, value, clientId) => {
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
  if (key.startsWith("default.instance")) {
    const tmp = await makeDefaultInstance(model, clientId);
    if (typeof tmp === "string") {
      return tmp;
    }
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

export const resolveDefaultInstance = async (model, clientId) => {
  if (model.value) {
    model.value = parseInt(model);
    return;
  }
  if (model.key !== "default.instance") {
    const base = await db("wsapi_config")
      .where("key", "default.instance")
      .where("client_id", clientId)
      .first();
    if (base) {
      model.value = parseInt(base.value);
      return;
    }
  }
  const niInstance = await db("wsapi_instances").where("client_id", 1).first();
  if (niInstance) {
    model.value = niInstance.id;
    return;
  }
  model.value = 0;
};

export const makeDefaultInstance = async (model, clientId) => {
  model.value = parseInt(value);
  if (isNaN(model.value) || model.value < 1) {
    return "config.default.instance.value.invalid";
  }
  const instance = await db("wsapi_instances")
    .where("id", value)
    .where("client_id", req.client.id)
    .first();
  if (!instance) {
    return "config.default.instance.value.invalid";
  }
};
