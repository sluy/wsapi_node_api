const { dropAllExpired } = require("../../../repositories/instances.js");

const deleteAction = async (req, res) => {
  await dropAllExpired();
  res.json({
    status: 'ok',
    message: "process executed successfully",
  });
};

module.exports = {
  deleteAction,
};
