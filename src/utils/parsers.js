const utf8 = require("utf8");

const parseArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  const tmp = [];
  if (typeof value === "object" && value !== null) {
    for (const current of value) {
      tmp.push(current);
    }
    return tmp;
  }
  return tmp;
};

const parseInt = (value) => {
  value = parseInt(parseString(value));
  return isNaN(value) ? 0 : value;
};

const parseString = (value) => {
  if (typeof value === "number") {
    value = value.toString();
  } else if (typeof value === "boolean") {
    value = value ? "true" : "false";
  } else if (typeof value !== "string") {
    value = "";
  }
  return value.trim();
};
const parsePhone = (value) => {
  if (typeof value === "number") {
    value = value.toString();
  }
  if (typeof value !== "string") {
    value = "";
  }
  return value.trim().replace(/\D/g, "");
};

const parseObject = (raw) => {
  if (typeof raw === "object" && raw !== null) {
    return raw;
  }
  if (typeof raw === "string") {
    try {
      const tmp = JSON.parse(raw);
      if (typeof tmp === "object" && tmp !== null) {
        return tmp;
      }
    } catch (error) {
      //
    }
  }
  return {};
};

const injectVars = (message, vars, chrs) => {
  chrs = parseString(chrs);
  if (chrs === "") {
    chrs = "[]";
  }
  const startChr = chrs[0];
  const endChr = chrs.length === 1 ? "" : chrs.charAt(1);

  let str = parseString(message);
  let flatVars = flatten(parseObject(vars));
  if (str === "" || Object.keys(flatVars).length < 1) {
    return str;
  }
  for (const key in flatVars) {
    const lookup = `${startChr}${key}${endChr}`;
    const replace = parseString(flatVars[key]);
    str = str.replaceAll(lookup, replace);
  }
  return str;
};

function traverseAndFlatten(currentNode, target, flattenedKey) {
  for (var key in currentNode) {
    if (currentNode.hasOwnProperty(key)) {
      var newKey;
      if (flattenedKey === undefined) {
        newKey = key;
      } else {
        newKey = flattenedKey + "." + key;
      }

      var value = currentNode[key];
      if (typeof value === "object") {
        traverseAndFlatten(value, target, newKey);
      } else {
        target[newKey] = value;
      }
    }
  }
}

function flatten(obj) {
  var flattenedObject = {};
  traverseAndFlatten(obj, flattenedObject);
  return flattenedObject;
}

module.exports = {
  parseArray,
  parsePhone,
  parseString,
  parseInt,
  injectVars,
  flatten,
  parseObject,
};
