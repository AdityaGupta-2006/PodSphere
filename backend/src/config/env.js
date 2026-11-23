const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "podsphere_jwt_super_secret_key_2026";
const NODE_ENV = process.env.NODE_ENV || "development";

module.exports = {
  PORT,
  CLIENT_URL,
  JWT_SECRET,
  NODE_ENV
};
