const express = require("express");
const auth_middleware = require("../auth_funcs/auth_middleware");
const {
  post_blog,
  get_create,
  get_blog,
  patch_blog,
  delete_blog_req,
} = require("../controllers/blog_controller");

const blog_router = express.Router();

// GET Blog
blog_router.get("/blogs/:id", auth_middleware, get_blog);
// GET /create
blog_router.get("/create", auth_middleware, get_create);
// PATCH Blog /edit/:id
blog_router.patch("/edit/:id", auth_middleware, patch_blog);
// DELETE blog /delete/:id
blog_router.delete("/delete/:id", auth_middleware, delete_blog_req);
// POST Blog - create
blog_router.post("/create", auth_middleware, post_blog);

module.exports = { blog_router };
