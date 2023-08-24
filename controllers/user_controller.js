// these are functions that handle the request and respond to the requests
// functions in ../fetching_funcs/insert_user.js are needed (is_user_unique, hash_password, insert_user)
// middleware included where needed check comments below

// post signup helpers
const {
  is_user_unique,
  hash_password,
  insert_user,
} = require("../fetching_funcs/insert_user");
// post login helpers
const {
  get_user_login_info,
  verify_user_login,
} = require("../auth_funcs/login_auth");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const sql = require("../model/db");

require("dotenv").config();
// GET user profile as requested by the user
const get_user_profile = (req, res) => {
  if (!res.locals.user)
    return res.status(400).json({ error: "user must be signed in!" });
  const username = res.locals.user.username;
  sql
    .begin(async (sql) => {
      return await sql`
    select * from blogs where author_id = (select users.id from users where username = ${username})
    `;
    })
    .then((data) => {
      res.status(200).json({ blogs: data, user: res.locals.user });
    })
    .catch((err) => {
      res.status(500).json({ error: err?.message || err });
    });
};

// GET Signup page
const get_signup = (req, res) => {
  sql`select username from users`
    .then((data) => {
      const users = data?.map((user) => {
        return user.username;
      });
      if (res.locals.user !== null)
        res.status(302).json({ user: res.locals.user, users });
      else res.status(200).json({ user: res.locals.user, users });
    })
    .catch((err) =>
      res
        .status(500)
        .json({ error: err?.message || err, user: res.locals.user })
    );
};

// middleware for handling formdata file upload
const upload = multer({ storage: multer.memoryStorage() });

// POST Signup handler middleware
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
              res.status(500).json({ error: err?.message || err });
            });
        })
        .catch((err) => {
          // if something goes wrong with hashing
          res.status(500).json({ error: err?.message || err });
        });
    })
    .catch((err) => {
      // if username is not unique
      res.status(400).json({ error: err?.message || err });
    });
};
// after inserting using middleware to sign an access jsonwebtoken and send it to user
// // generate refresh token as well, save it on server then send the access token to the user
const set_refresh_token = (username) => {
  // the only helper function in this file
  // create refresh token
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
        // update db with new refresh token
        resolve(true);
      })
      .catch((err) => {
        // catch db update error
        reject(err?.message || err);
      });
  });
};
// POST signup middleware
const send_jwt = (req, res) => {
  set_refresh_token(res.locals.username)
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
    .catch((err) => res.status(500).json({ error: err?.message || err }));
};

// GET Login
const get_login = (req, res) => {
  if (res.locals.user !== null) res.status(302).json({ user: res.locals.user });
  else res.status(200).json({ user: res.locals.user });
};
// POST Login
const post_login = (req, res) => {
  const creds_buffer = Buffer.from(
    req.headers.authorization.split(" ")[1],
    "base64"
  );
  const creds = creds_buffer.toString("utf-8").split(":");
  const username = creds[0];
  const password = creds[1];
  get_user_login_info(username)
    .then((password_hash) => {
      verify_user_login(password, password_hash)
        .then(() => {
          // generate new access token
          const access_token = jwt.sign(
            { username },
            process.env.TOKEN_SECRET,
            { expiresIn: 60 }
          );
          // set access token as httpOnly cookie
          res.cookie("access_token", access_token, {
            httpOnly: true,
            sameSite: "Lax",
          });
          // generate refresh token and update user's refresh token
          set_refresh_token(username)
            .then(() => {
              res
                .status(200)
                .send("login access token issued and refresh token set");
            })
            .catch((err) =>
              res.status(500).json({ error: err?.message || err })
            );
        })
        .catch((err) => {
          if ((err || err?.message) === "The password you entered is wrong 😔")
            res.status(400).json({ error: err?.message || err });
          else res.status(500).json({ error: err?.message || err });
        });
    })
    .catch((err) => {
      if ((err || err?.message) === "The username you entered is wrong 😔")
        res.status(400).json({ error: err?.message || err });
      else res.status(500).json({ error: err?.message || err });
    });
};

const post_logout = (req, res) => {
  if (!res.locals.user)
    return res
      .status(400)
      .json({ error: "can't logout if you're not signed in 🐱‍👤" });
  res.clearCookie("access_token");
  res.locals.user = null;
  res.status(200).send("success");
};

module.exports = {
  get_user_profile,
  get_signup,
  upload,
  post_signup_controller,
  send_jwt,
  get_login,
  post_login,
  post_logout,
};
