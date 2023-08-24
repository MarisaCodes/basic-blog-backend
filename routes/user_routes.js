const express = require("express");
const user_routes = express.Router();

const {
  post_signup_controller,
  send_jwt,
  upload,
  post_login,
  get_signup,
  get_login,
  get_user_profile,
  post_logout,
} = require("../controllers/user_controller");
const auth_middleware = require("../auth_funcs/auth_middleware");
// GET single users profile page (as requested by same user, protected)
user_routes.get("/user", auth_middleware, get_user_profile);
// Signup route
// get signup
user_routes.get("/signup", auth_middleware, get_signup);
// post signup
user_routes.post(
  "/signup",
  upload.single("pfp"),
  post_signup_controller,
  send_jwt
);
// Login routes
// get login
user_routes.get("/login", auth_middleware, get_login);
//post login
user_routes.post("/login", post_login);

// POST logout
user_routes.post("/logout", auth_middleware, post_logout);
module.exports = { user_routes };
