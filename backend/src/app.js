const express = require("express");
const cors = require("cors");
const { CLIENT_URL } = require("./config/env");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "PodSphere API Server is running"
  });
});

app.use("/api", routes);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
