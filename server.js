const express = require("express");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// middleware
app.use(morgan("dev"));

app.listen(process.env.PORT);
