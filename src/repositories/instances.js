const { db } = require("../bootstrap/db.js");
const { v4 } = require("uuid");
const md5 = require("md5");
const date = require("../utils/datetime.js");
const config = require("../config.js");
const whatsapi = require("./whatsapi/instances.js");

const {
  isInteger,
  isObject,
  toInteger,
  isEmpty,
  isString,
} = require("../utils/datatypes.js");

function isValid(raw, checkID) {
  return isObject(raw, {
    id: (val) => isInteger(val) && (!checkID || toInteger(val) > 0),
    name: (val) => isString(val) && !isEmpty(val),
    code: (val) => isString(val) && !isEmpty(val),
  });
}
async function parse(raw) {

  if (Array.isArray(raw)) {
    const instances = [];
    for (const current of raw) {
      const instance = await parse(current);
      if (typeof instance === 'object' && instance !== null && !Array.isArray(instance)) {
        instances.push(instance);
      }
    }
    return instances;
  }

  if (!isObject(raw)) {
    raw = {};
  }
  raw.id = toInteger(raw.id);
  if (raw.id < 1) {
    delete raw.id;
  }
  for (const key of ["name", "info", "code", "qr", 'secret']) {
    raw[key] = typeof raw[key] === "string" ? raw[key].trim() : "";
  }
  for (const key of ["created_at", "updated_at", "whatsapi_created_at"]) {
    raw[key] = date.toJS(raw[key]);
    if (!raw[key]) {
      if (key === "created_at") {
        raw[key] = date.now().toJSDate();
      } else if (key === "updated_at") {
        raw[key] = raw.created_at;
      }
    }
  }
  if (typeof raw.connected === "number" || typeof raw.connected === "string") {
    raw.connected = parseInt(raw.connected) === 1 ? true : false;
  }
  if (typeof raw.connected !== "boolean") {
    raw.connected = false;
  }
  await dropIfExpired(raw);
  return raw;
}

async function createMainInstance(clientId) {
  const client = await db('clientes').where('id', clientId).first();
  const res = create(
    config.instances.default.name,
    (client) ? client.nombre : config.instances.default.info,
    clientId
  );
  if (res === "instance.create.error.name.exists") {
    return true;
  }
  return res;
}

async function dropAllExpired() {
  const all = await db("wsapi_instances").whereNot('module', 'waziper').whereNotNull("secret").whereNot('secret', '').where('connected', 0);
  for (const current of all) {
    try {
      await dropIfExpired(current);  
    } catch (error) {
      //none
    }
  }
}

async function dropIfExpired(instance) {
  if (Array.isArray(instance)) {
    for (const current of instance) {
      await dropIfExpired(current);
    }
    return instance;
  }
  const validation = {
    code: (v) => isString(v) && !isEmpty(v),
  };
  if (!isObject(instance, validation)) {
    return instance;
  }
  const connected = instance.connected === true || parseInt(instance.connected) === 1;
  const code = instance.code.trim();
  const secret = instance.secret.trim();
  const id = toInteger(instance.id);
  const now = date.now().toJSDate();

  if (secret !== '' && !connected) {
    let mustDrop = false;
    if (!instance.whatsapi_created_at) {
      mustDrop = true;
    } else {
      let expiration = date.diffNow(instance.whatsapi_created_at, "minutes");
      if (expiration > config.instances.expiration) {
        mustDrop = true;
      }
    }
    if (mustDrop) {
      console.log('DEBERIA ELIMINAR?', mustDrop);
      const res = await whatsapi.drop(code);
      if (res === true) {
        instance.secret = "";
        instance.qr = "";
        instance.connected = false;
        instance.whatsapi_created_at = null;
        instance.updated_at = now;
        if (id > 0) {
          await db("wsapi_instances").where("id", instance.id).update({
            secret: instance.secret,
            qr: instance.qr,
            connected: instance.connected,
            whatsapi_created_at: instance.whatsapi_created_at,
            updated_at: instance.updated_at,
          });
        }
      }
    }     
  }
  return instance;
}

async function all(clientId) {
  await createMainInstance(clientId);
  const instances = await db("wsapi_instances")
    .whereNot('module', 'waziper')
    .where("client_id", clientId)
    .orderBy("name", "asc");
  return await parse(instances);
}

async function create(name, info, clientId) {
  if (typeof name === "number") {
    name = name.toString().trim();
  }
  if (typeof info === "number") {
    info = info.toString().trim();
  }
  name = typeof name !== "string" ? "" : name.trim();
  info = typeof info !== "string" ? "" : info.trim();
  if (name === "") {
    return "instance.create.error.name.invalid";
  }

  const exists = await find(name, "name", clientId);
  if (typeof exists === "object" && exists !== null) {
    return "instance.create.error.name.exists";
  }
  const code = md5(v4());
  const data = await parse({
    client_id: clientId,
    name,
    info,
    code,
  });

  try {
    const id = await db("wsapi_instances").insert(data, "*");
    const instance = await find(id[0], "id", clientId);
    return instance;
  } catch (error) {
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
    .whereNot('module', 'waziper')
    .where("client_id", clientId)
    .where("name", name)
    .first();
  if (exists && exists.id !== i.id) {
    return "instance.update.error.name.exists";
  }
  const instance = await db("wsapi_instances").where("id", i.id).update({
    name,
    info,
    updated_at: date.now.toJSDate(),
  });
  return instance;
}

async function refresh(value, field, clientId) {
  const instance = await find(value, field, clientId);
  
  if (instance) {
    if (instance.secret) {
      await whatsapi.drop(instance.code);
    }
    instance.secret = ''
    instance.whatsapi_created_at = null;
    instance.connected = 0;
    instance.qr = '';
    instance.updated_at = date.now().toJSDate();
    await db("wsapi_instances").where("id", instance.id).update(instance);
  }
  return instance;
}

async function drop(value, field, clientId, injectInfo) {
  const i = await find(value, field, clientId, injectInfo);
  if (!i) {
    return "instance.drop.error.not_found";
  }
  const status = await whatsapi.drop(i.code);
  if (status !== true) {
    return status;
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

  if (instance) {
    return await parse(instance);
  }
  return undefined;
}

async function getQR(value, field, clientId) {
  const instance = await find(value, field, clientId);
  if (!instance) {
    return 'instances.get.qr.error.not_found';
  }
  const now = date.now().toJSDate();

  if (instance.secret === "") {
    const data = await whatsapi.create(instance.code);
    if (typeof data === "string") {
      return data;
    }
    instance.secret = data.secret;
    instance.updated_at = now;
    instance.whatsapi_created_at = now;
    await db("wsapi_instances").where("id", instance.id).update({
      secret: instance.secret,
      whatsapi_created_at: instance.whatsapi_created_at,
      updated_at: instance.whatsapi_created_at,
    });
  }

  const data = await whatsapi.getQR(instance.code);
  if (typeof data === "string") {
    return data;
  }
  if (instance.qr !== data.qr) {
    instance.qr = data.qr;
    instance.updated_at = now;
    await db("wsapi_instances").where("id", instance.id).update({
      qr: instance.qr,
      updated_at: instance.updated_at,
    });
  }
  if (data.src) {
    instance.qr_src = data.src;
  }
  return instance;
}

module.exports = {
  all,
  find,
  create,
  update,
  refresh,
  drop,
  getQR,
  isValid,
  parse,
  dropIfExpired,
  dropAllExpired,
};
