const Manager = require('../../repositories/manager.js');

const postAction = async (req, res) => {
  try {
    const data = await Manager.exec(req.input('instance_id'), req.client.id, req.input('call'), req.input('payload'));
    if (typeof data === 'string') {
      return res.status(500).json({ status: false, message: data});
    }
    return res.status(200).json({ status: true, data });
  } catch (error) {
    const payload = {
        status: false,
        message: 'unknown error',
        error: null,
        stack: null,
    }
    if (typeof error === 'object' && error !== null) {
        if (typeof error.message === 'string') {
            payload.message = error.message;
        }
        payload.error = JSON.parse(JSON.stringify(error));
        if (error instanceof Error) {
            payload.stack = typeof error.stack === 'string' && error.stack !=='' ? error.stack.split('\n').map((v) => v.trim()) : error.stack;
            payload.name = error.name;
        }
    }
    return res.status(500).json(payload); 
  }
}

module.exports = { postAction };



