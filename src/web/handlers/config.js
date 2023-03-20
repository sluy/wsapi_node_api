import { get, set } from "../../repositories/config.js";

export const putAction = async (req, res) => {
  return postAction(req, res);
};

export const getAction = async (req, res) => {
  const data = await get(req.input("key"), req.client.id);
  if (typeof data === "string") {
    res.status(400).json({
      status: false,
      message: data,
    });
    return;
  }
  res.status(200).json({
    status: true,
    data,
  });
};

export const postAction = async (req, res) => {
  const data = await set(req.input("key"), req.input("value"), req.client.id);
  if (typeof data === "string") {
    res.status(400).json({
      status: false,
      message: data,
    });
    return;
  }
  res.status(200).json({
    status: true,
    data,
  });
};
