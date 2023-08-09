const postgres = require("postgres");
require("dotenv").config();

const sql = postgres(process.env.DB_CON_URL);

module.exports = sql;
