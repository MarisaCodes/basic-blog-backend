const express = require("express");
const get_index = require("../controllers/index_controller");
const auth_middleware = require("../auth_funcs/auth_middleware");

const index_router = express.Router();

// GET homepage /

index_router.get("/", auth_middleware, get_index);

module.exports = { index_router };
