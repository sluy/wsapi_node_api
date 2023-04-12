const axios = require("axios");
const config = require("../config");
const api = axios.create({
  baseURL: config.api.url,
  headers: {
    "Content-Type": "application/json",
    api_key: config.api.secret,
  },
});

module.exports = { api };
