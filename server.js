const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { index_router } = require("./routes/index_routes");

const morgan = require("morgan");
const { user_routes } = require("./routes/user_routes");
const { blog_router } = require("./routes/blog_routes");

require("dotenv").config();

const app = express();

// middleware
app.use(cors({ origin: process.env.ORIGIN, credentials: true }));
app.use(morgan("dev")); // dev
app.use(cookieParser());
app.use(express.json());
// routes
app.get("/", (req, res) => res.send("hello world")); // for testing
// homepage
app.use("/api/", index_router);
// user auth
app.use("/api/", user_routes);
// blog (POST, GET (bog by id), PATCH (edit blog))
app.use("/api/", blog_router);
app.listen(process.env.PORT);
