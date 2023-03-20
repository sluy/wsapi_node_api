import fs from "fs";
import { DateTime } from "luxon";
import { logs as logPath } from "./file.js";
import config from "../config.js";

export const write = (name, action, data) => {
  if (config.logs.status === false) {
    return;
  }
  const path = logPath(name + ".log");
  let content = DateTime.now().toSQL() + " " + action;
  if (data !== undefined) {
    content += " " + JSON.stringify(data);
  }
  content += "\n" + read(name);
  fs.writeFileSync(path, content);
};

export const read = (name) => {
  const path = logPath(name + ".log");
  if (fs.existsSync(path)) {
    return fs.readFileSync(path).toString();
  }
  return "";
};

export default write;
