const { DateTime, Interval } = require("luxon");

function toISO(val, defaultValue) {
  const tmp = toDateTime(val, defaultValue);
  if (tmp) {
    return toDateTime(val, defaultValue).toISO();
  }
  return null;
}

function toDateTime(val, defaultValue) {
  const tmp = toJS(val, defaultValue);
  if (tmp) {
    return DateTime.fromJSDate(tmp);
  }
  return null;
}

function toJS(val, defaultValue) {
  if (typeof val === "string") {
    val = val.trim();
    if (val === "") {
      val = null;
    } else {
      const tmp = DateTime.fromISO(val);
      if (tmp.isValid) {
        val = tmp.toJSDate();
      } else {
        val = null;
      }
    }
  } else if (val instanceof DateTime && val.isValid) {
    val = val.toJSDate();
  }
  if (val instanceof Date) {
    return val;
  }
  if (defaultValue !== undefined && defaultValue !== null) {
    const tmp = toJSDate(defaultValue, null);
    if (tmp) {
      return tmp;
    }
  }
  return null;
}

function now() {
  return DateTime.now();
}

function isoNow() {
  return DateTime.now().toISO();
}

function parseDateTime(val) {
  if (val instanceof DateTime) {
    return val;
  } else if (val instanceof Date) {
    return DateTime.fromJSDate(val);
  } else if (typeof val === "string") {
    return DateTime.fromISO(val);
  }
}

function diffNow(datetime, format) {
  return diff(datetime, now(), format);
}

function diff(first, last, format) {
  if (!format) {
    format = "milliseconds";
  }
  const d1 = parseDateTime(first);
  const d2 = parseDateTime(last);
  const d = Interval.fromDateTimes(d1, d2).length(format);
  if (d < 0) {
    return d * 1;
  }
  return d;
}

module.exports = {
  now,
  isoNow,
  diffNow,
  diff,
  parseDateTime,
  toJS,
  toISO,
  toDateTime,
};
