const Instance = require('../../repositories/instance.js');

const postAction = async (req, res) => {
  try {
    const data = await Instance.exec(req.instance_id, req.client.id, req.input('call'), req.input('payload'));
    if (typeof data === 'string') {
      return res.status(500).json({ status: false, message: data});
    }
    return res.status(200).json({ status: true, data });
  } catch (error) {
    return res.status(500).json({ status: false, error }); 
  }
}

module.exports = { postAction };



