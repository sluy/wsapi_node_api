const {
  parsePhone,
  parseString,
} = require("../../utils/parsers");

function validateBasics(node, payload, exclude) {
  if (!Array.isArray(exclude)) {
    exclude = [exclude];
  }
  if (typeof payload !== 'object' || payload === null) {
    return `${node}.error.invalid`;
  }
  for (const key of ['code', 'secret', 'number']) {
    payload[key] = parseString(payload[key]).trim();
    if (payload[key] === '' && !exclude.includes(key)) {
      return `${node}.error.${key}.required`;
    }
  }
  payload.number = parsePhone(payload.number);
  if (payload.number === '' && !exclude.includes('number')) {
    return `${node}.error.number.invalid`;
  }
  if (typeof payload.vars !== 'object' || payload.vars === null) {
    payload.vars = {};
  }
  return true;
}

module.exports = {
  validateBasics
}