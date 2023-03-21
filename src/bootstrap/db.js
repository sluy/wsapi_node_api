const knex = require("knex");
const config = require("../config.js");
const db = knex({
  client: "mysql",
  connection: {
    host: config.db.host,
    port: 3306,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
  },
});

module.exports = { db };
