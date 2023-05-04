const { api } = require("../../bootstrap/api.js");
const {
  parseString,
  injectVars,
} = require("../../../utils/parsers");
const { validateBasics } = require('./helpers.js');

/**
 * Returns instance device info.
 * @param {object} payload An object with keys:
 *                         - 'code': Instance code.
 *                         - 'secret': Instance secret.
 *                         - 'vars': An object with a vars to inject.
 * @return {Promise<object|string>}
 */
async function device(payload) {
  let node = 'whatsapi.account.get.device';
  const validation = validateBasics(node, payload, 'number');
  if (typeof validation === 'string') {
    return validation;
  }
  const headers = {
    'x-instance-id': payload.code,
    'x-instance-secret': payload.secret,
  }
  const route = `account`;
  try {
    const res = await api.get(route, { headers });
    if (typeof res.data !== 'object' || res.data === null) {
      return `${node}.error.api.internal`;
    }
    return res.data;
  } catch (error) {
    console.log(error);
    return `${node}.error.api.internal`;
  }
}

const set = {
  /**
   * Sets the display name of instance.
   * @param {object} payload An object with keys:
   *                         - 'code': Instance code.
   *                         - 'secret': Instance secret.
 *                           - 'value': Name to set.
   * @return {Promise<true|string>}
   */
  name: async (payload)  => {
    let node = 'whatsapi.account.set.name';
    const validation = validateBasics(node, payload, 'phone');
    if (typeof validation === 'string') {
      return validation;
    }
    const data = {
      name: injectVars(parseString(payload.value).trim(), payload.vars)
    };
    const headers = {
      'x-instance-id': payload.code,
      'x-instance-secret': payload.secret,
    }
    const route = `account/set-name`;
    try {
      const res = await api.post(route, data, { headers });
      if (
        typeof res.data !== "object" ||
        res.data === null
      ) {
        return `${node}.error.api.internal`;
      }
      return true; //res.data;
    } catch (error) {
      console.log(error);
      return `${node}.error.api.internal`;
    }
  },  
  /**
   * Sets the display status of instance.
   * @param {object} payload An object with keys:
   *                         - 'code': Instance code.
   *                         - 'secret': Instance secret.
   *                         - 'value': Status to set.
   * @return {Promise<true|string>}
   */
  status: async (payload)  => {
    let node = 'whatsapi.account.set.status';
    const validation = validateBasics(node, payload, 'phone');
    if (typeof validation === 'string') {
      return validation;
    }  
    const data = {
      status: injectVars(parseString(payload.value).trim(), payload.vars)
    };

    const headers = {
      'x-instance-id': payload.code,
      'x-instance-secret': payload.secret,
    }
    const route = `account/set-name`;
    try {
      const res = await api.post(route, data, { headers });
      if (
        typeof res.data !== "object" ||
        res.data === null
      ) {
        return `${node}.error.api.internal`;
      }
      return true; //res.data;
    } catch (error) {
      console.log(error);
      return `${node}.error.api.internal`;
    }
  },
}

module.exports = {
  device,
  set,
};