
const serverless = require("serverless-http");
const app = require("./api");
exports.handler = serverless(app);
