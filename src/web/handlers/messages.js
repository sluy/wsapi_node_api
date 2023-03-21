const { send } = require("../../repositories/messages.js");
const postAction = async (req, res) => {
  const type = req.input("type");
  const config = req.input("config");

  const data = await sendMessage(req.client.id, type, config);
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
module.exports = { postAction };
