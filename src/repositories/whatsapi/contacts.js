const { api } = require("../../bootstrap/api.js");
const { validateBasics } = require('./helpers.js');

const get = {
  /**
   * Returns all instance contacts.
   * @param {object} payload An object with keys:
   *                         - 'code': Instance code.
   *                         - 'secret': Instance secret.
   *                         - 'vars': An object with a vars to inject.
   * @returns {object[]|string}
   */
  all: async (payload) => {
    let node = 'whatsapi.contacts.get.all';
    const validation = validateBasics(node, payload, 'number');
    if (typeof validation === 'string') {
      return validation;
    }
    const headers = {
      'x-instance-id': payload.code,
      'x-instance-secret': payload.secret,
    }
    const route = `contacts`;
    try {
      const res = await api.get(route, { headers });
      if (!Array.isArray(res.data)) {
        return `${node}.error.api.internal`;
      }
      return res.data;
    } catch (error) {
      console.log(error);
      return `${node}.error.api.internal`;
    }
  },
  /**
   * Returns an specific contact info by phone number.
   * @param {object} payload An object with keys:
   *                         - 'code': Instance code.
   *                         - 'secret': Instance secret.
   *                         - 'number': Contact phone number.
   *                         - 'vars': An object with a vars to inject.
   * @returns {object[]|string}
   */
  one: async (payload) => {
    let node = 'whatsapi.contacts.get.one';
    const validation = validateBasics(node, payload);
    if (typeof validation === 'string') {
      return validation;
    }
    const headers = {
      'x-instance-id': payload.code,
      'x-instance-secret': payload.secret,
    }
    const route = `contacts/${payload.number}`;
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
  },
  /**
   * Returns an specific contact picture by phone number.
   * @param {object} payload An object with keys:
   *                         - 'code': Instance code.
   *                         - 'secret': Instance secret.
   *                         - 'number': Contact phone number.
   *                         - 'vars': An object with a vars to inject.
   * @returns {object|string} Returns an object with `src` key. src can be an url (string) or null if
   *                          cannot access to contact picture. On api error returns an string.
   */
  picture: async (payload) => {
    let node = 'whatsapi.contacts.get.picture';
    const validation = validateBasics(node, payload);
    if (typeof validation === 'string') {
      return validation;
    }
    const headers = {
      'x-instance-id': payload.code,
      'x-instance-secret': payload.secret,
    }
    const route = `contacts/${payload.number}/profile-picture`;
    try {
      const res = await api.get(route, { headers });
      if (typeof res.data === 'object' && res.data !== null) {
        if (res.data.status === 'success' && typeof res.data.message === 'string') {
          return { src: res.data.message };
        } else if (res.data.status === 'error' && typeof res.data.message === 'string' && res.data.message.toLowerCase() === 'not found') {
          return { src: null }
        }
      }
      return `${node}.error.api.internal`;
    } catch (error) {
      console.log(error);
      return `${node}.error.api.internal`;
    }
  },
  /**
   * Determines if an phone number is a valid whatsapp account number.
   * @param {object} payload An object with keys:
   *                         - 'code': Instance code.
   *                         - 'secret': Instance secret.
   *                         - 'number': Contact phone number.
   *                         - 'vars': An object with a vars to inject.
   * @returns {boolean|string} Returns true if is a whatsapp account number, otherwise false. On
   *                           any error returns an string.
   */
  valid: async (payload) => {
    let node = 'whatsapi.contacts.get.valid';
    const validation = validateBasics(node, payload);
    if (typeof validation === 'string') {
      return validation;
    }
    const headers = {
      'x-instance-id': payload.code,
      'x-instance-secret': payload.secret,
    }
    const route = `contacts/${payload.number}/validate`;
    try {
      const res = await api.get(route, { headers });
      if (typeof res.data === 'object' && res.data !== null) {
        if (res.data.status === 'success' && typeof res.data.message === 'string') {
          return res.data.status === 'success';
        }
      }
      return `${node}.error.api.internal`;
    } catch (error) {
      console.log(error);
      return `${node}.error.api.internal`;
    }
  }
}
module.exports = { get };