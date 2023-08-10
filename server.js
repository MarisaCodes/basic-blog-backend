const express = require("express");
const cookieParser = require("cookie-parser");
const { index_router } = require("./routes/index_routes");

const morgan = require("morgan");
const { user_routes } = require("./routes/user_routes");

require("dotenv").config();

const app = express();

// middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
// routes
app.get("/", (req, res) => res.send("hello world")); // for testing
// homepage
app.use("/api/", index_router);
// user auth
app.use("/api/", user_routes);
app.listen(process.env.PORT);
