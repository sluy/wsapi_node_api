const {
  find,
  create,
  update,
  drop,
  all,
  refresh,
} = require("../../repositories/instances.js");

const headAction = async (req, res) => {
  const a = await all(req.client.id);
  console.log('INSTANCES HEAD!', a);
  res.json({
    status: true,
    data: a,
  });
};

const patchAction = async (req, res) => {
  console.log('INSTANCES PATCH');
  const model = await refresh(
    req.input("value"),
    req.input("field"),
    req.client.id
  );
  if (model) {
    res.json({
      status: true,
      data: model,
    });
    return;
  }
  res.json({
    status: false,
    message: "instances.refresh.error.not_found",
  });
}

const getAction = async (req, res) => {
  console.log('INSTANCES GET');
  const model = await find(
    req.input("value"),
    req.input("field"),
    req.client.id
  );
  if (model) {
    res.json({
      status: true,
      data: model,
    });
    return;
  }
  res.json({
    status: false,
    message: "instances.get.error.not_found",
  });
};

const postAction = async (req, res) => {
  const model = await create(
    req.input("name"),
    req.input("info"),
    req.client.id
  );
  if (typeof model === "string") {
    res.status(400).json({
      status: false,
      message: model,
    });
  } else {
    res.status(200).json({
      status: true,
      data: model,
    });
  }
};

const putAction = async (req, res) => {
  const model = await update(
    {
      value: req.input("value"),
      field: req.input("field"),
    },
    req.input("name"),
    req.input("info"),
    req.client.id
  );

  if (typeof model === "string") {
    res.status(400).json({
      status: false,
      message: model,
    });
  } else {
    res.status(200).json({
      status: true,
      data: model,
    });
  }
};

const deleteAction = async (req, res) => {
  const model = await drop(
    req.input("value"),
    req.input("field"),
    req.client.id
  );
  if (typeof model === "string") {
    res.status(400).json({
      status: false,
      message: model,
    });
  } else {
    res.status(200).json({
      status: true,
      data: model,
    });
  }
};

module.exports = {
  headAction,
  getAction,
  postAction,
  putAction,
  patchAction,
  deleteAction,
};
