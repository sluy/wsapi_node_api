const { app } = require("./bootstrap/server.js");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");

const middlewares = {
  before: {
    named: {},
    unnamed: [],
  },
  after: {
    named: {},
    unnamed: [],
  },
};

async function router(req, res, defaultRoute) {
  req.input = (key, defaultValue) => {
    for (const current of [req.body, req.query]) {
      if (typeof current === "object" && current !== null) {
        if (key in current && key !== undefined) {
          return current[key];
        }
      }
    }
    return defaultValue;
  };
  let route =
    typeof req.input("route") !== "string" ? "" : req.input("route").trim();
  let spoffing =
    typeof req.input("_method") === "string"
      ? req.input("_method").trim().toLowerCase()
      : "";
  if (
    ["get", "post", "put", "patch", "delete", "options", "head"].includes(
      spoffing
    )
  ) {
    req.method = spoffing;
  }

  let handler = null;
  let found = false;
  let error = undefined;
  let data = undefined;
  let call = null;
  if (typeof route !== "string") {
    route = "";
  }
  if (route === "" && typeof defaultRoute === "string") {
    route = defaultRoute.trim();
  }
  if (route !== "") {
    const file = path.join(__dirname, "/web/handlers", route + ".js");
    if (fs.existsSync(file) && fs.lstatSync(file).isFile()) {
      try {
        handler = await import(file);
        if (typeof handler === "object" && handler !== null) {
          for (const method of [req.method.toLowerCase(), "all"]) {
            const action = method + "Action";
            if (typeof handler[action] === "function") {
              call = { route, method, action, handler: handler[action] };
              break;
            }
          }
        }
      } catch (e) {
        error = e;
      }
    }
  }

  if (!error && call) {
    try {
      const before = [
        middlewares.before.unnamed,
        middlewares.before.named[call.route],
        middlewares.before.named[call.route + "." + call.method],
      ];
      const after = [
        middlewares.after.unnamed,
        middlewares.after.named[call.route],
        middlewares.after.named[call.route + "." + call.method],
      ];
      for (const current of before) {
        if (Array.isArray(current)) {
          for (const middleware of current) {
            if (res.headersSent) {
              break;
            }
            if (typeof middleware === "function") {
              await middleware(req, res, call);
            }
          }
        }
      }
      if (!res.headersSent) {
        const response = await call.handler(req, res);
        if (response !== undefined && !res.headersSent) {
          data = response;
        }
        found = true;
        let next = undefined;
        for (const current of before) {
          if (Array.isArray(current)) {
            for (const middleware of current) {
              if (next === false) {
                break;
              }
              if (typeof middleware === "function") {
                next = await middleware(req, res, call);
              }
            }
          }
        }
      }
    } catch (e) {
      error = e;
    }
  }

  if (!res.headersSent) {
    if (error) {
      res.status(500).json({
        status: false,
        message: "Internal error",
        data: error,
      });
      console.log(error);
    } else if (!found) {
      res.status(404).json({
        status: false,
        message: "Route not found.",
      });
    } else if (data !== undefined) {
      res.status(200).json({
        status: true,
        data,
      });
    } else {
      res.status(204).json({
        status: true,
        message: "Route has been executed without any response.",
      });
    }
  }
}

app.options("/", async (req, res) => {
  await router(req, res, "webhook");
});

app.get("/", async (req, res) => {
  await router(req, res, "webhook");
});

app.post("/", async (req, res) => {
  await router(req, res, "webhook");
});
app.put("/", async (req, res) => {
  await router(req, res, "webhook");
});
app.patch("/", async (req, res) => {
  await router(req, res, "webhook");
});
app.delete("/", async (req, res) => {
  await router(req, res, "webhook");
});

module.exports = { middlewares };
