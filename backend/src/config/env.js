const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || !jwtSecret.trim()) {
  if (NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production mode.");
  }
  jwtSecret = "podsphere_jwt_super_secret_key_2026";
}
const JWT_SECRET = jwtSecret;

module.exports = {
  PORT,
  CLIENT_URL,
  JWT_SECRET,
  NODE_ENV
};
