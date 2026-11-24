const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const PORT = parseInt(process.env.PORT, 10) || 5001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5174";
const NODE_ENV = process.env.NODE_ENV || "development";

if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
  throw new Error(
    "Configuration Error: JWT_SECRET environment variable is required. Please define JWT_SECRET in your .env file."
  );
}

const dbUrlToValidate = (NODE_ENV === "test" && process.env.TEST_DATABASE_URL)
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

if (!dbUrlToValidate || !dbUrlToValidate.trim()) {
  throw new Error(
    "Configuration Error: DATABASE_URL environment variable is required. Please define DATABASE_URL in your .env file."
  );
}

try {
  const dbUrl = new URL(dbUrlToValidate.trim());
  if (!dbUrl.protocol.startsWith("postgres")) {
    throw new Error("Configuration Error: DATABASE_URL must be a valid postgresql:// connection URL.");
  }
} catch (urlErr) {
  if (urlErr.message.startsWith("Configuration Error:")) {
    throw urlErr;
  }
  throw new Error("Configuration Error: DATABASE_URL is not a valid URL format.");
}

const JWT_SECRET = process.env.JWT_SECRET.trim();

module.exports = {
  PORT,
  CLIENT_URL,
  JWT_SECRET,
  NODE_ENV
};
