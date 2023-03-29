const { DateTime, Interval } = require("luxon");

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
};
