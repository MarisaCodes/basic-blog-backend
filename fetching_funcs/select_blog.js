// get blog helper
const sql = require("../model/db");
const select_blog = (id) => {
  return new Promise((resolve, reject) => {
    sql`select * from blogs where blogs.id = ${id};`
      .then((data) => {
        if (data?.length === 1) resolve(data[0]);
        else reject("not found");
      })
      .catch((err) => reject(err?.message || err));
  });
};
module.exports = { select_blog };
