const sql = require("../model/db");
const bcrypt = require("bcrypt");
const sharp = require("sharp");

require("dotenv").config();

// some helper functions for signup POST

const is_user_unique = (username) => {
  // check if username is unique before signup
  return new Promise(async (resolve, reject) => {
    try {
      const data =
        await sql`select username from users where username = ${username}`;
      if (data?.length) reject("Sorry, this username is already taken 😢");
      else if (data?.length === 0) resolve(true);
    } catch (err) {
      reject(err?.message || err);
    }
  });
};

const hash_password = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      bcrypt.hash(password, Number(process.env.SALT_ROUNDS), (err, hash) => {
        if (err) reject(err?.message || err);
        else resolve(hash);
      });
    } catch (err) {
      reject(err?.message || err);
    }
  });
};

const handle_upload = async (file) => {
  const { buffer, mimetype } = file;
  return new Promise((resolve, reject) => {
    sharp(buffer)
      .resize(200, 200, { fit: "cover" })
      .toBuffer()
      .then((bf) => {
        resolve({ base64: bf.toString("base64"), mimetype });
      })
      .catch((err) => reject(err?.message || err));
  });
};

const insert_user = (user, file) => {
  // user param is an array of a user object
  // file is from req.file returned by multer middleware

  return new Promise((resolve, reject) => {
    try {
      sql
        .begin(async (sql) => {
          if (!file) {
            return await sql`insert into users ${sql(user)} 
            returning username;`;
          } else {
            return await handle_upload(file)
              .then(async (pfp_data) => {
                return await sql`insert into users (username, password_hash, pfp, pfp_mime) 
                values (
                    ${user[0].username}, ${user[0].password_hash},
                    decode(${pfp_data.base64}, 'base64'), ${pfp_data.mimetype}
                    )
                returning username;`;
              })
              .catch((err) => reject(err?.message || err));
          }
        })
        .then((data) => {
          if (data?.length === 1) resolve(data[0].username);
          else reject("an error has occured");
        })
        .catch((err) => {
          reject(err?.message || err);
        });
    } catch (err) {
      reject(err?.message || err);
    }
  });
};

module.exports = { is_user_unique, hash_password, insert_user };
