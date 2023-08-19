const dotenv = require("dotenv").config();

const PORT = process.env.PORT;

const baseURL = "http://localhost:" + PORT;

const urls = { baseURL };

module.exports = urls;
