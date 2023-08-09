const express = require("express");
const get_index = require("../controllers");

const index_router = express.Router();

// GET homepage /

index_router.get("/", get_index);

module.exports = { index_router };
