const express = require("express");
const user_routes = express.Router();

const {
  post_signup_controller,
  send_jwt,
  upload,
} = require("../controllers/user_controller");

// Signup route
user_routes.post(
  "/signup",
  upload.single("pfp"),
  post_signup_controller,
  send_jwt
);

module.exports = { user_routes };
