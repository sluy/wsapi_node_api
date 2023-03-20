import axios from "axios";
import config from "../config.js";
export const api = axios.create({
  baseURL: config.api.url,
  headers: {
    "Content-Type": "application/json",
    api_key: config.api.secret,
  },
});
