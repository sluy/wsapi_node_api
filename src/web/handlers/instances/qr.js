const { getQR } = require("../../../repositories/instances.js");

const getAction = async (req, res) => {
  const data = await getQR(
    req.input("value"),
    req.input("field"),
    req.client.id
  );
  if (data) {
    res.json({
      status: true,
      data,
    });
    return;
  }
  res.json({
    status: false,
    message: "instances.qr.get.error.not_found",
  });
};

module.exports = {
  getAction,
};
