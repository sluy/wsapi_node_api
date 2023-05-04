const { api } = require("../../bootstrap/api.js");
const {
  parseString,
  injectVars,
} = require("../../../utils/parsers");
const { validateBasics } = require('./helpers.js');

const get = {
  /**
   * Returns all chats of instance.
   * @param {object} payload An object with keys:
   *                         - 'code': Instance code.
   *                         - 'secret': Instance secret.
   *                         - 'vars': An object with a vars to inject.
   * @returns {Promise<object[]|string>}
   */
  all: async (payload) => {
    let node = 'whatsapi.chat.get.all';
    const validation = validateBasics(node, payload, 'number');
    if (typeof validation === 'string') {
      return validation;
    }
    const headers = {
      'x-instance-id': payload.code,
      'x-instance-secret': payload.secret,
    }
    const route = `chat/all`;
    try {
      const res = await api.get(route, { headers });
      if (Array.isArray(res.data)) {
        return `${node}.error.api.internal`;
      }
      return res.data;
    } catch (error) {
      console.log(error);
      return `${node}.error.api.internal`;
    }
  },

  /**
   * Returns a specific chat info by their number.
   * @param {object} payload An object with keys:
   *                         - 'code': Instance code.
   *                         - 'secret': Instance secret.
   *                         - 'number': Chat phone number.
   *                         - 'message': Message to send.
   *                         - 'quote_message_id': Quoted message id (optional).
   *                         - 'vars': An object with a vars to inject.
   * @returns {object|string}
   */
  one: async (payload) => {
    let node = 'whatsapi.chat.get.one';
    const validation = validateBasics(node, payload);
    if (typeof validation === 'string') {
      return validation;
    }
    const headers = {
      'x-instance-id': payload.code,
      'x-instance-secret': payload.secret,
    }
    const route = `chat/${payload.number}`;
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
};

const message = {
  /**
   * Returns all messages of provided instance with specific number.
   * @param {object} payload An object with keys:
   *                         - 'code': Instance code.
   *                         - 'secret': Instance secret.
 *                           - 'number': Chat phone number.
   *                         - 'message': Message to send.
   *                         - 'quote_message_id': Quoted message id (optional).
   *                         - 'vars': An object with a vars to inject.
   * @returns {object[]|string}
   */
  all: async (payload)  => {
    let node = 'whatsapi.chat.message.all';
    const validation = validateBasics(node, payload);
    if (typeof validation === 'string') {
      return validation;
    }  
    const headers = {
      'x-instance-id': payload.code,
      'x-instance-secret': payload.secret,
    }
    const route = `chat/${payload.number}/messages`;
    try {
      const res = await api.get(route, { headers });
      if (
        typeof res.data !== "object" ||
        res.data === null ||
        res.data.status !== 'success' ||
        !Array.isArray(res.data.message)
      ) {
        return `${node}.error.api.internal`;
      }
      return res.data.message;
    } catch (error) {
      console.log(error);
      return `${node}.error.api.internal`;
    }
  },  
  /**
   * Sends a text message to specific number.
   * @param {object} payload An object with keys:
   *                         - 'code': Instance code.
   *                         - 'secret': Instance secret.
 *                           - 'number': Chat phone number.
   *                         - 'message': Message to send.
   *                         - 'quote_message_id': Quoted message id (optional).
   *                         - 'vars': An object with a vars to inject.
   * @returns {object|string}
   */
  text: async (payload)  => {
    let node = 'whatsapi.chat.message.text.send';
    const validation = validateBasics(node, payload);
    if (typeof validation === 'string') {
      return validation;
    }  
    const data = {};
    for (const key of ['message', 'quote_message_id']) {
      data[key] = injectVars(parseString(payload[key]).trim(), payload.vars);
    }
    if (data.message === "") {
      return node + ".error.message.invalid";
    }
    const headers = {
      'x-instance-id': payload.code,
      'x-instance-secret': payload.secret,
    }
    const route = `chat/send-message/${payload.number}`;
    try {
      const res = await api.post(route, data, { headers });
      if (
        typeof res.data !== "object" ||
        res.data === null ||
        typeof res.data.status !== "success"
      ) {
        return `${node}.error.api.internal`;
      }
      return res.data;
    } catch (error) {
      console.log(error);
      return `${node}.error.api.internal`;
    }
  },
  /**
   * Sends a picture message to specific number.
   * @param {object} payload An object with keys:
   *                         - 'code': Instance code.
   *                         - 'secret': Instance secret.
 *                           - 'number': Chat phone number.
   *                         - 'image': Image url or base64.
   *                         - 'caption': Image text (optional).
   *                         - 'vars': An object with a vars to inject.
   * @returns {object|string}
   */
  image: async (payload)  => {
    let node = 'whatsapi.chat.message.image.send';
    const validation = validateBasics(node, payload);
    if (typeof validation === 'string') {
      return validation;
    }  
    const data = {};
    for (const key of ['image', 'caption']) {
      data[key] = injectVars(parseString(payload[key]).trim(), payload.vars);
    }
    if (data.image === "") {
      return node + ".error.image.invalid";
    }
    const headers = {
      'x-instance-id': payload.code,
      'x-instance-secret': payload.secret,
    }
    const route = `chat/send-image/${payload.number}`;
    try {
      const res = await api.post(route, data, { headers });
      if (
        typeof res.data !== "object" ||
        res.data === null ||
        typeof res.data.status !== "success"
      ) {
        return `${node}.error.api.internal`;
      }
      return res.data;
    } catch (error) {
      console.log(error);
      return `${node}.error.api.internal`;
    }
  },
  /**
   * Sends a file to specific number.
   * @param {object} payload An object with keys:
   *                         - 'code': Instance code.
   *                         - 'secret': Instance secret.
 *                           - 'number': Chat phone number.
   *                         - 'file': File url or base64.
   *                         - 'mime': Mimetype of file (ex. image/png)
   *                         - 'caption': File text (optional).
   *                         - 'vars': An object with a vars to inject.
   * @returns {object|string}
   */
  file: async (payload)  => {
    let node = 'whatsapi.chat.message.file.send';
    const validation = validateBasics(node, payload);
    if (typeof validation === 'string') {
      return validation;
    }  quote_message_id = parseString(payload.quote_message_id).trim();

    const data = {};
    for (const key of ['file', 'mime', 'caption']) {
      data[key] = injectVars(parseString(payload[key]).trim(), payload.vars);
    }
    if (data.file === "") {
      return node + ".error.file.invalid";
    }
    if (data.mime === "") {
      return node + ".error.mime.invalid";
    }
    const headers = {
      'x-instance-id': payload.code,
      'x-instance-secret': payload.secret,
    }
    const route = `chat/send-file/${payload.number}`;
    try {
      const res = await api.post(route, data, { headers });
      if (
        typeof res.data !== "object" ||
        res.data === null ||
        typeof res.data.status !== "success"
      ) {
        return `${node}.error.api.internal`;
      }
      return res.data;
    } catch (error) {
      console.log(error);
      return `${node}.error.api.internal`;
    }
  },  
 /**
  * Sends a location to specific number.
  * @param {object} payload An object with keys:
  *                         - 'code': Instance code.
  *                         - 'secret': Instance secret.
 *                          - 'number': Chat phone number.
  *                         - 'file': File url or base64.
  *                         - 'mime': Mimetype of file (ex. image/png)
  *                         - 'caption': File text (optional).
  *                         - 'vars': An object with a vars to inject.
  * @returns {object|string}
  */
 location: async (payload)  => {
   let node = 'whatsapi.chat.message.location.send';
   const validation = validateBasics(node, payload);
   if (typeof validation === 'string') {
     return validation;
   }  quote_message_id = parseString(payload.quote_message_id).trim();

   const data = {};
   for (const key of ['lat', 'lng']) {
     data[key] = injectVars(parseString(payload[key]).trim(), payload.vars);
     if (data[key] === '') {
      return `${node}.error.${key}.required`;
     }
     const test = parseFloat(data[key]);
     if (isNaN(test)) {
      return `${node}.error.${key}.invalid`;
     }
   }
   const headers = {
     'x-instance-id': payload.code,
     'x-instance-secret': payload.secret,
   }
   const route = `chat/send-location/${payload.number}`;
   try {
     const res = await api.post(route, data, { headers });
     if (
       typeof res.data !== "object" ||
       res.data === null ||
       typeof res.data.status !== "success"
     ) {
       return `${node}.error.api.internal`;
     }
     return res.data;
   } catch (error) {
     console.log(error);
     return `${node}.error.api.internal`;
   }
 },
}

module.exports = {
  get,
  message
};