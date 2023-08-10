const sql = require("../model/db");
const get_user_id = (username) => {
  return new Promise((resolve, reject) => {
    sql`select users.id from users where username = ${username};`
      .then((data) => {
        if (data?.length === 1 && data[0]?.id) resolve(data[0].id);
        else reject("Something went wrong");
      })
      .catch((err) => reject(err?.message || err));
  });
};
const insert_blog = (blog) => {
  return new Promise((resolve, reject) => {
    sql
      .begin(async (sql) => {
        return await sql`
            insert into blogs ${sql(blog)}
            returning *;`;
      })
      .then((data) => {
        if (data?.length) resolve(data[0]);
        else reject("could not get back blog, successful insert");
      })
      .catch((err) => reject(err?.message || err));
  });
};
module.exports = { get_user_id, insert_blog };
