const { api } = require("../bootstrap/api.js");
const { db } = require("../bootstrap/db.js");
const { v4 } = require("uuid");
const md5 = require("md5");
const { DateTime, Interval } = require("luxon");
const { isAxiosError } = require("axios");

async function all(clientId) {
  const raw = await db("wsapi_instances")
    .where("client_id", clientId)
    .orderBy("name", "asc");
  const instances = [];
  for (const instance of raw) {
    const injected = await injectApiInfo(instance);
    if (typeof injected === "object" && injected !== null) {
      instances.push(injected);
    }
  }
  return instances;
}

/**
 * Regenera la instancia de whatsapi para evitar errores con el código QR o que la instancia haya sido borrada.
 * @param {*} instance
 * @returns
 */
async function regenerateInstance(instance) {
  try {
    await api.delete("auth/terminate", {
      headers: {
        "x-instance-id": instance.code,
      },
    });
    const res = await api.post("auth/register", {
      instance_id: instance.code,
    });
    instance.secret = res.data.secret;
    instance.qr = "";
    instance.updated_at = DateTime.now().toSQL();
    const instance = await db("wsapi_instances")
      .where("id", instance.id)
      .update({
        secret: instance.secret,
        qr: "",
        updated_at: instance.updated_at,
      });
    return true;
  } catch (error) {
    return false;
  }
}

async function create(name, info, clientId) {
  if (typeof name === "number") {
    name = name.trim();
  }
  if (typeof info === "number") {
    info = info.trim();
  }
  name = typeof name !== "string" ? "" : name.trim();
  info = typeof info !== "string" ? "" : info.trim();
  if (name === "") {
    return "instance.save.error.name.invalid";
  }
  const exists = await db("wsapi_instances")
    .where("client_id", clientId)
    .where("name", name)
    .first();
  if (exists) {
    return "instance.save.error.name.exists";
  }
  const code = md5(v4());
  const now = DateTime.now().toISODate();
  try {
    const res = await api.post("auth/register", {
      instance_id: code,
    });
    if (
      typeof res.data !== "object" ||
      res.data === null ||
      typeof res.data.secret !== "string" ||
      typeof res.data.secret.trim() === ""
    ) {
      return "instance.save.error.api.wrong";
    }
    const id = await db("wsapi_instances").insert(
      {
        client_id: clientId,
        code,
        name,
        info,
        secret: res.data.secret,
        qr: "",
        created_at: now,
        updated_at: now,
      },
      "*"
    );
    const instance = await find(id[0], "id", clientId);
    return await injectApiInfo(instance);
  } catch (error) {
    console.log(error);
    return "instance.save.error.api.internal";
  }
}

async function update(search, name, info, clientId) {
  const i = await find(search, null, clientId);
  if (!i) {
    return "instance.update.error.not_found";
  }
  if (typeof name === "number") {
    name = name.trim();
  }
  if (typeof info === "number") {
    info = info.trim();
  }
  name = typeof name !== "string" ? "" : name.trim();
  info = typeof info !== "string" ? "" : info.trim();
  if (name === "") {
    return "instance.update.error.name.invalid";
  }
  const exists = await db("wsapi_instances")
    .where("client_id", clientId)
    .where("name", name)
    .first();
  if (exists && exists.id !== i.id) {
    return "instance.update.error.name.exists";
  }
  const instance = await db("wsapi_instances").where("id", i.id).update({
    name,
    info,
    updated_at: DateTime.now().toSQL(),
  });
  return await injectApiInfo(instance);
}

async function drop(value, field, clientId) {
  const i = await find(value, field, clientId);
  if (!i) {
    return "instance.drop.error.not_found";
  }
  let failed = false;
  try {
    await api.delete("auth/terminate", {
      headers: {
        "x-instance-id": i.code,
      },
    });
  } catch (error) {
    if (
      !isAxiosError(error) ||
      !error.response ||
      error.response.status !== 404
    ) {
      console.log(error);
      return "instance.drop.error.api.internal";
    }
  }
  await db("wsapi_instances").where("id", i.id).delete();
  return i;
}

async function find(value, field, clientId) {
  if (typeof value === "object" && value !== null) {
    field = value.field;
    value = value.value;
  }
  if (typeof value === "number") {
    value = value.toString();
  }
  value = typeof value !== "string" ? "" : value.trim();
  if (value === "") {
    return undefined;
  }
  if (typeof field !== "string") {
    field = "";
  }
  if (!["id", "code", "qr", "secret", "name"].includes(field)) {
    field = "name";
  }
  if (field === "id") {
    value = parseInt(value);
    if (isNaN(value) || value < 1) {
      return undefined;
    }
  }
  const instance = await db("wsapi_instances")
    .where(field, value)
    .where("client_id", clientId)
    .first();

  return await injectApiInfo(instance);
}

async function injectApiInfo(instance) {
  for (const call of [injectStatus, injectQR]) {
    const res = await call(instance);
    if (typeof res !== "object" || res === null) {
      return undefined;
    }
  }
  return instance;
}

async function injectQR(instance) {
  if (
    typeof instance !== "object" ||
    instance === null ||
    typeof instance.code !== "string" ||
    instance.code === ""
  ) {
    return instance;
  }
  instance.qr_src = null;
  try {
    const res = await api.get("auth/getqr", {
      headers: { "x-instance-id": instance.code },
    });
    if (typeof res.data === "object" && res.data !== null) {
      if (
        typeof res.data.qrcode === "string" &&
        res.data.qrcode !== "" &&
        instance.qr !== res.data.qrcode
      ) {
        await db("wsapi_instances").where("id", instance.id).update({
          qr: res.data.qrcode,
        });
        instance.qr = res.data.qrcode;
      }
      if (typeof res.data.base64 === "string" && res.data.base64 !== "") {
        instance.qr_src = res.data.base64;
      }
    }
  } catch (error) {
    //
  }
  return instance;
}

async function injectStatus(instance) {
  if (
    typeof instance !== "object" ||
    instance === null ||
    typeof instance.code !== "string" ||
    instance.code === ""
  ) {
    return instance;
  }
  instance.connected = false;
  instance.version = null;
  let action = "regenerate";
  try {
    const res = await api.get("auth/status", {
      headers: { "x-instance-id": instance.code },
    });
    if (typeof res.data === "object" && res.data !== null) {
      if (typeof res.data.connected === "boolean") {
        instance.connected = res.data.connected;
      }
      if ("version" in res.data) {
        instance.version = res.data.version;
      }
      action = "drop";
    }
  } catch (error) {
    //
  }
  if (!instance.connected) {
    let diff = Interval.fromDateTimes(
      DateTime.fromISO(instance.update_at),
      DateTime.now()
    ).length("minutes");
    if (diff < 0) {
      diff *= -1;
    }
    if (diff > 5) {
      if (action === "drop") {
        await drop(instance.id, "id", instance.client_id);
        return undefined;
      } else {
        await regenerateInstance(instance);
      }
    }
  }
  return instance;
}
module.exports = { all, find, create, update, drop };
