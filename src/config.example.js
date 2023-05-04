module.exports = {
  dev: {
    status: false,
    port: 8000,
  },
  db: {
    host: "localhost",
    user: "dbuser",
    password: "dbpass",
    name: "dbname",
  },
  api: {
    url: "http://wsapi.url",
    secret: "secret code",
  },
  logs: {
    status: true,
  },
};
