const account = require('./whatsapi/account.js');
const chats = require('./whatsapi/chats.js');
const contacts = require('./whatsapi/contacts.js');
const instances = require('./instances.js');
const { write } = require('../utils/log.js');
const { db } = require('../bootstrap/db.js');
const { default: knex } = require('knex');

class Manager {
  /**
   * @param {{[index:string]:any, code: string, secret: string}} instance
   */
  constructor(instance) {
    if (typeof instance !== 'object' || typeof instance === null) {
      throw new Error('Invalid instance.');
    }
    for (const key of ['code', 'secret']) {
      if (typeof instance[key] !== 'string' || instance[key].trim() === '') {
        throw new Error(`Invalid instance ${instance[key]}.`);
      }
    }
    this.instance = instance;
    this.chats = new Chats(this);
    this.account = new Account(this);
    this.contacts = new Contacts(this);
    this.messages = new Messages(this);
    this.vars = {};
  }
  setVars(data) {
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        this.vars[key] = data[key];
      }
    }
  }
  /**
   * Creates a payload used by whatsapi repository.
   * @param {Record<string, any>} data Data to be injected in payload.
   * @return {{[index:string]:any, code: string, secret: string, vars: Record<string, any>}}
   */
  payload(data) {
    const r = {};
    for (const key of ['code', 'secret']) {
      r[key] = this.instance[key];
    }
    r.vars = this.vars;
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        r[key] = data[key];
      }
    }
    return r;
  }
}

class Chats {
  /**
   * @param {Manager} parent 
   */
  constructor(parent) {
    this.parent = parent;
  }

  async all() {
    const res = [];
    try {
      const raw = await chats.get.all(this.parent.payload());
      if (Array.isArray(raw)) {
        for (const current of raw) {
          if (typeof current === 'object' && current !== null) {
            current.services = await db('servicios')
              .where('cliente_id', this.parent.instance.client_id)
              .where(knex.raw(`REGEXP_REPLACE(wsapp_contratante, '[a-zA-Z\+\_ ]+', '') = '${current.id.user}'`));




            /** Funciona, pero ralentiza la respuesta MUCHO.
            if (current.profile_picture === null) {
              try {
                  const tmp = await contacts.get.picture(this.parent.payload({ number: current.id.user}));  
                  if (typeof tmp === 'object' && tmp !== null && typeof tmp.src === 'string' && tmp.src !== '') {
                      current.profile_picture = tmp.src;
                  }    
              } catch (error) {
                  //Do nothing.
              }
            }
            res.push(current);
              */
          }
        }
      } else {
          return {
              typo: typeof raw,
              data: raw,
          }
      }
    } catch (error) {
      return error;
    }
    return res;
  }

  async one(payload) {
    return await chats.get.one(this.parent.payload(payload));
  }
}

class Messages {
  /**
   * @param {Manager} parent 
   */
  constructor(parent) {
    this.parent = parent;
  }
  
  async all(payload) {
    return await chats.message.all(this.parent.payload(payload));
  }

  async text(payload) {
    return await chats.message.text(this.parent.payload(payload));
  }

  async image(payload) {
    return await chats.message.image(this.parent.payload(payload));
  }

  async file(payload) {
    return await chats.message.file(this.parent.payload(payload));
  }

  async location(payload) {
    return await chats.message.location(this.parent.payload(payload));
  }
}

class Account {
  /**
   * @param {Manager} parent 
   */
  constructor(parent) {
    this.parent = parent;
  }
  
  async device() {
    return await account.device(this.parent.payload());
  }

  async setName(payload) {
    return await account.set.name(this.parent.payload(payload));
  }

  async setStatus(payload) {
    return await account.set.status(this.parent.payload(payload));
  }
}

class Contacts {
  /**
   * @param {Manager} parent 
   */
  constructor(parent) {
    this.parent = parent;
  }

  async all() {
    return await contacts.get.all(this.parent.payload());
  }

  async one(payload) {
    return await contacts.get.one(this.parent.payload(payload));
  }

  async picture(payload) {
    return await contacts.get.picture(this.parent.payload(payload));
  }

  async valid(payload) {
    return await contacts.get.valid(this.parent.payload(payload));
  }
}


/**
 * Returns a instance of provided search.
 * @param {*} searchValue Value to search.
 * @param {*} searchKey   Key to use.
 * @param {*} clientId    Associated client id.
 * @returns {Promise<string|Manager>}
 */
Manager.find = async (searchValue, searchKey, clientId) => {
  const i = await instances.find(searchValue, searchKey, clientId);
  if (typeof i === 'object' && i !== null) {
    return new Manager(i);
  }
  return i;
}

Manager.exec = async(instanceId, clientId, call, payload) => {
  console.log(instanceId, clientId, call, payload);
  const i = await Manager.find(instanceId, 'id', clientId);
  if (typeof i === 'string') {
    return i;
  }
  const err = 'instance.exec.error.call.invalid';
  if (typeof call !== 'string' || call.trim() === '') {
    return err;
  }
  const tmp = call.trim().split('.');
  const rec = [i];
  //Preventing infinite loop.
  while(rec.length < 5) {
    const key = tmp.shift().trim();
    const last = rec.length - 1;
    if (key === '' ||!rec[last][key]) { 
      return err;
    }
    if (tmp.length === 0) {
      if (typeof rec[last][key] === 'function') {
        return rec[last][key](payload);
      }
      return err;
    }
    if (typeof rec[last][key] !== 'object' || rec[last][key] === null) {
      return err;
    }
    rec.push(rec[last][key]);
  }
  return err;
}
module.exports = Manager;
