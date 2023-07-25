const { logger } = require("../helpers/logger.js");

require("dotenv").config();

if (process.env.NODE_ENV === "production") {
  // Export DB URI for Mongo Atlas
  logger.info("prod");
  const dbURI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@bram-test-mongodb.koftlqn.mongodb.net/ideas-log-db?retryWrites=true&w=majority`;
  module.exports = { mongoURI: dbURI };
} else {
  logger.info("dev");
  // Export DB URI for local Mongo DB
  const dbURI = `mongodb://127.0.0.1:27017/vidjot-dev`;
  module.exports = { mongoURI: dbURI };
}
