import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";

export function fileDirName(meta) {
  const __filename = fileURLToPath(meta.url);
  const __dirname = dirname(__filename);
  return { __dirname, __filename };
}
export function base(...path) {
  const { __dirname } = fileDirName(import.meta);

  const basePath = resolve(__dirname + "/../../");
  return join(basePath, ...path);
}

export function src(...path) {
  return join(resolve(base() + "/src/"), ...path);
}

export function tmp(...path) {
  return join(resolve(base() + "/tmp/"), ...path);
}

export function logs(...path) {
  return join(resolve(tmp() + "/logs/"), ...path);
}

export function bootstrap(...path) {
  return join(resolve(src() + "/bootstrap/"), ...path);
}

export function repositories(...path) {
  return join(resolve(src() + "/repositories/"), ...path);
}

export function libs(...path) {
  return join(resolve(src() + "/libs/"), ...path);
}
