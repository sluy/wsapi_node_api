const { api } = require("../../bootstrap/api.js");
const { isAxiosError } = require("axios");

/**
 * Creates a new instance in whatsapi.
 * @param {string} code Instance codename.
 * @returns
 */
async function create(code) {
  if (typeof code !== "string" || code.trim() === "") {
    return "whatsapi.instance.create.error.code.invalid";
  }
  try {
    const res = await api.post("auth/register", {
      instance_id: code.trim(),
    });
    if (
      typeof res.data !== "object" ||
      res.data === null ||
      typeof res.data.secret !== "string" ||
      typeof res.data.secret.trim() === ""
    ) {
      return "whatsapi.instance.create.error.api.internal";
    }
    return {
      secret: res.data.secret,
    };
  } catch (error) {
    console.log(error);
    return "instance.save.error.api.internal";
  }
}

async function drop(code) {
  if (typeof code !== "string" || code.trim() === "") {
    return "whatsapi.instance.drop.error.code.invalid";
  }
  try {
    await api.delete("auth/terminate", {
      headers: {
        "x-instance-id": code,
      },
    });
  } catch (error) {
    if (
      !isAxiosError(error) ||
      !error.response ||
      error.response.status !== 404
    ) {
      return "instance.drop.error.api.internal";
    }
  }
  return true;
}

async function getQR(code) {
  const data = {
    qr: "",
    src: "",
  };
  try {
    const res = await api.get("auth/getqr", {
      headers: { "x-instance-id": code },
    });
    if (typeof res.data === "object" && res.data !== null) {
      if (typeof res.data.qrcode === "string" && res.data.qrcode !== "") {
        data.qr = res.data.qrcode;
      }
      if (typeof res.data.base64 === "string" && res.data.base64 !== "") {
        data.src = res.data.base64;
      }
    }
  } catch (error) {
    //
  }
  return data;
}

module.exports = { create, drop, getQR };
