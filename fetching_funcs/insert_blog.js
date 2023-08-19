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

const update_blog = (blog) => {
  return new Promise((resolve, reject) => {
    sql
      .begin(async (sql) => {
        return await sql`
    update blogs set title = ${blog.title},
    content = ${blog.content},
    updated_at = now()
    where blogs.author_id = ${blog.author_id}
    and blogs.id = ${blog.id}
    returning *;
    `;
      })
      .then((data) => {
        if (data?.length) resolve(data[0]);
        else reject("could not get back blog, failed to update");
      })
      .catch((err) => reject(err?.message || err));
  });
};

const delete_blog = (blog_id, author_id) => {
  console.log(blog_id, author_id);
  return new Promise((resolve, reject) => {
    sql
      .begin(async (sql) => {
        return await sql`
        DELETE FROM BLOGS WHERE id = ${blog_id} AND author_id = ${author_id} RETURNING *`;
      })
      .then((data) => {
        if (data?.length) resolve(data[0]);
        else reject("could not delete");
      })
      .catch((err) => reject(err?.message || err));
  });
};
module.exports = { get_user_id, insert_blog, update_blog, delete_blog };
