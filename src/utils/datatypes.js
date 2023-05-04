function isString(val) {
  return typeof val === "string";
}
function isEmpty(val) {
  return (
    val === undefined ||
    val === null ||
    (typeof val === "string" && val.trim() === "") ||
    (Array.isArray(val) && val.length === 0) ||
    (typeof val === "object" && Object.keys(val).length === 0)
  );
}

function toInteger(val, defaultValue) {
  if (typeof val === "string" || typeof val === "number") {
    val = parseInt(val);
    if (!isNaN(val)) {
      return val;
    }
  }
  return defaultValue !== undefined ? defaultValue : 0;
}

/**
 * Determines if provided value are an object.
 * @param {*} val Value to check
 * @param {Object} propsValidation Can be a callback or an object with validation to inner properties.
 *                                 In callback case will receive as parameter the object to validate.
 *                                 In object case, Key will be the prop name
 *                                 to validate and value a function to validate value. It receives 2 params,
 *                                 first the value, complete object as second.
 * @returns {boolean}
 */
function isObject(val, propsValidation) {
  if (Array.isArray(val) || typeof val !== "object" || val === null) {
    return false;
  }
  if (typeof propsValidation === "function") {
    if (propsValidation(val) === false) {
      return false;
    }
  } else if (typeof propsValidation === "object" && propsValidation !== null) {
    for (const key in propsValidation) {
      const callback = propsValidation[key];
      if (typeof callback === "function") {
        let res = callback(val[key], val);
        if (res === false) {
          return false;
        }
      }
    }
  }
  return true;
}

function isInteger(val) {
  if (typeof val === "number") {
    val = val.toString();
  }
  if (typeof val === "string") {
    const tmp = parseInt(val);
    if (!isNaN(val) && tmp.toString() === val) {
      return true;
    }
  }
  return false;
}

module.exports = { isInteger, isString, isEmpty, isObject, toInteger };
