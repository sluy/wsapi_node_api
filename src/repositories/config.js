const { db } = require("../bootstrap/db.js");

const get = async (key, clientId) => {
  clientId = parseInt(clientId);

  if (isNaN(clientId) || clientId < 1) {
    clientId = 1;
  }

  if (key === "" || key === null || key === undefined) {
    return "config.get.key.required";
  }
  if (typeof key !== "string") {
    return undefined;
  }

  key = key.trim();

  if (key === "") {
    return undefined;
  }

  const lookup = [clientId];
  if (!lookup.includes(1)) {
    lookup.push(1);
  }

  for (const current of lookup) {
    const model = await db("wsapi_config")
      .where("client_id", current)
      .where("key", key)
      .first();

    if (model && typeof model.value === "string") {
      model.value = model.value.trim();

      if (model.value !== "") {
        try {
          const tmp = JSON.parse(model.value);
          if (![undefined, "", null].includes(tmp)) {
            console.log("Devuelvo", key, current, tmp);
            return tmp;
          }
        } catch (error) {
          //
        }
        return model;
      }
    }
  }
  return "config.get.not_found";
};

const set = async (key, value, clientId) => {
  if (!clientId) {
    clientId = 1;
  }
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
