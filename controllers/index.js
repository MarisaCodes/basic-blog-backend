const fetch_db_index = require("../fetching_funcs/fetch_db_index");

// controller to get the homepage
const get_index = (req, res) => {
  fetch_db_index() // fetch blog and corresponding user information -> see fetch_db_index.js
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(400).json({ error: err.message, data: null });
    });
};

module.exports = get_index;
