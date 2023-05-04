const { join, resolve } = require("path");

function base(...path) {
  const basePath = resolve(__dirname + "/../../");
  return join(basePath, ...path);
}

function src(...path) {
  return join(resolve(base() + "/src/"), ...path);
}

function tmp(...path) {
  return join(resolve(base() + "/tmp/"), ...path);
}

function logs(...path) {
  return join(resolve(tmp() + "/logs/"), ...path);
}

function bootstrap(...path) {
  return join(resolve(src() + "/bootstrap/"), ...path);
}

function repositories(...path) {
  return join(resolve(src() + "/repositories/"), ...path);
}

function libs(...path) {
  return join(resolve(src() + "/libs/"), ...path);
}

module.exports = {
  base,
  src,
  tmp,
  logs,
  bootstrap,
  repositories,
  libs,
};
