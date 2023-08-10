// these are functions that handle the request and respond to the requests
// functions in ../fetching_funcs/insert_user.js are needed (is_user_unique, hash_password, insert_user)
// middleware included where needed check comments below

const {
  is_user_unique,
  hash_password,
  insert_user,
} = require("../fetching_funcs/insert_user");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const sql = require("../model/db");
require("dotenv").config();

// middleware for handling formdata file upload
const upload = multer({ storage: multer.memoryStorage() });

// post handler middleware
const post_signup_controller = (req, res, next) => {
  // username and password get saved in req.headers.authorization
  // example string: req.headers.authorization = Basic cmVpbXU6cmVpbXUxMjM=
  // Basic means the credentials are encrypted as base64 strings
  // the rest is a base64 string
  // the utf-8 format is <username>:<password>
  // example, after converting cmVpbXU6cmVpbXUxMjM= to utf-8 you get: reimu:reimu123
  const creds_buffer = Buffer.from(
    req.headers.authorization.split(" ")[1],
    "base64"
  );
  const creds = creds_buffer.toString("utf-8").split(":");
  const username = creds[0];
  const password = creds[1];
  is_user_unique(username)
    .then(() => {
      hash_password(password)
        .then((hash) => {
          const user = [
            {
              username,
              password_hash: hash,
            },
          ];
          insert_user(user, req.file)
            .then((username) => {
              res.locals.username = username;
              next();
              return;
            })
            .catch((err) => {
              // if something goes wrong while inserting user into db
              res.status(500).json({ error: err.message || err });
            });
        })
        .catch((err) => {
          // if something goes wrong with hashing
          res.status(500).json({ error: err.message || err });
        });
    })
    .catch((err) => {
      // if username is not unique
      res.status(400).json({ error: err.message || err });
    });
};
// after inserting using middleware to sign an access jsonwebtoken and send it to user
// // generate refresh token as well, save it on server then send the access token to the user
const gen_refresh_token = (username) => {
  // the only helper function in this file
  const refresh_token = jwt.sign(
    { username },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: 60 * 60,
    }
  );
  return new Promise((resolve, reject) => {
    sql`update users set
          refresh_token = ${refresh_token}
          where username = ${username}`
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err.message || err);
      });
  });
};

const send_jwt = (req, res) => {
  // middleware
  gen_refresh_token(res.locals.username)
    .then(() => {
      const token = jwt.sign(
        { username: res.locals.username },
        process.env.TOKEN_SECRET,
        {
          expiresIn: 60,
        }
      );
      res.cookie("access_token", token, { httpOnly: true, sameSite: "Lax" });
      res.status(200).send("success");
    })
    .catch((err) => res.status(500).json({ error: err.message || err }));
};
module.exports = { upload, post_signup_controller, send_jwt };
