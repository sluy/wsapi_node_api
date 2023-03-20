import { read, write } from "../../utils/log.js";

export const getAction = (req, res) => {
  let name =
    typeof req.input("name") === "string" ? req.input("name").trim() : "";
  if (name === "") {
    res.status(400).json({
      status: false,
      message: "logs.get.error.name.invalid",
    });
    return;
  }
  res.json({
    status: true,
    data: read(name).split("\n"),
  });
};

export const postAction = (req, res) => {
  let name =
    typeof req.input("name") === "string" ? req.input("name").trim() : "";
  let action =
    typeof req.input("action") === "string" ? req.input("action").trim() : "";
  if (name === "") {
    res.status(400).json({
      status: false,
      message: "logs.get.error.name.invalid",
    });
    return;
  }
  if (action === "") {
    res.status(400).json({
      status: false,
      message: "logs.get.error.action.invalid",
    });
    return;
  }
  const data = req.input("data");
  write(name, action, data);
  res.json({
    status: true,
    data: read(name).split("\n"),
  });
};
