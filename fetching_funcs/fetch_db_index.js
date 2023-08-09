const sql = require("../model/db");

// a function to fetch the database. joins the users to blogs table and selects specific data needed
// to be exposed to the user in the homepage blog cards

const fetch_db_index = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await sql`select 
        username,
        blogs.id as blog_id,
        content,
        title,
        created_at,
        updated_at,
        slug,
        pfp_mime,
        encode(pfp, 'base64') as pfp
         from (blogs join users on users.id = blogs.author_id)
         ORDER BY updated_at DESC;`;
      if (res.length) resolve(res);
      else throw new Error("wow such empty");
      return res;
    } catch (err) {
      reject(err);
    }
  });
};
module.exports = fetch_db_index;
