const {
  get_user_id,
  insert_blog,
  update_blog,
  delete_blog,
} = require("../fetching_funcs/insert_blog");
const { select_blog } = require("../fetching_funcs/select_blog");
// GET create
const get_create = (req, res) => {
  if (res.locals.user === null) res.status(302).json({ user: res.locals.user });
  else res.status(200).json({ user: res.locals.user });
};

// POST blog - create
const post_blog = (req, res) => {
  const { title, content } = req.body;
  const { username } = res.locals.user;
  get_user_id(username)
    .then((author_id) => {
      const blog = [
        {
          title,
          content,
          author_id,
        },
      ];
      insert_blog(blog)
        .then((blog) => {
          res.status(200).json(blog);
        })
        .catch((err) => {
          res.status(500).json({ error: err?.message || err });
        });
    })
    .catch((err) => {
      res.status(500).json({ error: err?.message || err });
    });
};

// PATCH Blog (edit blog)

const patch_blog = (req, res) => {
  const { title, content } = req.body;
  const { id } = req.params;
  const { username } = res.locals.user;
  get_user_id(username)
    .then((author_id) => {
      const blog = {
        title,
        content,
        author_id,
        id,
      };
      update_blog(blog)
        .then((blog) => {
          res.status(200).json(blog);
        })
        .catch((err) => {
          res.status(500).json({ error: err?.message || err });
        });
    })
    .catch((err) => {
      res.status(500).json({ error: err?.message || err });
    });
};
// DELETE Blog
const delete_blog_req = (req, res) => {
  const id = req.params.id;
  const { username } = res.locals.user;
  get_user_id(username)
    .then((author_id) => {
      delete_blog(id, author_id)
        .then((deleted_blog) => {
          res.status(200).json(deleted_blog);
        })
        .catch((err) => {
          res.status(500).json({ error: err?.message || err });
        });
    })
    .catch((err) => {
      res.status(500).json({ error: err?.message || err });
    });
};
// GET blog by id /blog/:id
const get_blog = (req, res) => {
  const id = req.params.id;
  select_blog(id)
    .then((blog) => res.status(200).json({ blog, user: res.locals.user }))
    .catch((err) => {
      if ((err?.message || err) === "not found")
        res
          .status(404)
          .json({ error: err?.message || err, user: res.locals.user });
      else
        res
          .status(500)
          .json({ error: err?.message || err, user: res.locals.user });
    });
};
module.exports = {
  get_create,
  post_blog,
  get_blog,
  patch_blog,
  delete_blog_req,
};
