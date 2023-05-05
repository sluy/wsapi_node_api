const Manager = require('../../repositories/manager.js');

const postAction = async (req, res) => {
  try {
    const data = await Manager.exec(req.input('instance_id'), req.client.id, req.input('call'), req.input('payload'));
    if (typeof data === 'string') {
      return res.status(500).json({ status: false, message: data});
    }
    return res.status(200).json({ status: true, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error }); 
  }
}

module.exports = { postAction };



