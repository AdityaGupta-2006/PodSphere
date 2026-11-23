const app = require("./app");
const { PORT } = require("./config/env");

const server = app.listen(PORT, () => {
  console.log(`PodSphere backend running on http://localhost:${PORT}`);
});

module.exports = server;
