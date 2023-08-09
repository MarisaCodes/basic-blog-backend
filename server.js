const express = require("express");
const { index_router } = require("./routes/index_routes");

const morgan = require("morgan");

require("dotenv").config();

const app = express();

// middleware
app.use(morgan("dev"));

// routes
app.get("/", (req, res) => res.send("hello world"));
app.use("/api/", index_router);
app.listen(process.env.PORT);
