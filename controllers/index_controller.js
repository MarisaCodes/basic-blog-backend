const fetch_db_index = require("../fetching_funcs/fetch_db_index");

// controller to get the homepage
const get_index = (req, res) => {
  fetch_db_index() // fetch blog and corresponding user information -> see fetch_db_index.js
    .then((data) => {
      res.status(200).json({ data, user: res.locals.user });
    })
    .catch((err) => {
      if (err || err.message === "wow such empty")
        res.status(200).json({
          error: err.message || err,
          data: null,
          user: res.locals.user,
        });
      else
        res.status(400).json({
          error: err.message || err,
          data: null,
          user: res.locals.user,
        });
    });
};

module.exports = get_index;
