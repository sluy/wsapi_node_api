const fs = require("fs");
const { DateTime } = require("luxon");
const { logs } = require("./file.js");
const config = require("../config.js");

const write = (name, action, data) => {
  if (config.logs.status === false) {
    return;
  }
  const path = logs(name + ".log");
  let content = DateTime.now().toSQL() + " " + action;
  if (data !== undefined) {
    content += " " + JSON.stringify(data);
  }
  content += "\n" + read(name);
  fs.writeFileSync(path, content);
};

const read = (name) => {
  const path = logs(name + ".log");
  if (fs.existsSync(path)) {
    return fs.readFileSync(path).toString();
  }
  return "";
};
module.exports = { write, read };
