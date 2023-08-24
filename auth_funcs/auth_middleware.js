const jwt = require("jsonwebtoken");
const sql = require("../model/db");

require("dotenv").config();

// helper function to get refresh token
const get_refresh_token = async (username) => {
  return new Promise((resolve, reject) => {
    sql`select refresh_token from users where username = ${username};`
      .then((data) => {
        if (data?.length) resolve(data[0].refresh_token);
        else reject("no such user");
      })
      .catch((err) => reject(err?.message || err, 0));
  });
};
// authentication middleware (checking token validity on every server request)
const auth_middleware = (req, res, next) => {
  const access_token = req.cookies?.access_token;
  if (!access_token) {
    // if no access token in cookies, move on to next middleware
    //res.clearCookie("access_token"); //redundant
    res.locals.user = null;
    next();
    return;
  }
  try {
    // otherwise check for expiry of access token
    const decoded_access = jwt.verify(access_token, process.env.TOKEN_SECRET);
    const username = decoded_access.username;
    sql`select username, encode(pfp, 'base64') as pfp, pfp_mime from users where username = ${username};`
      .then((data) => {
        res.locals.user = data[0]; // if not expired set user, go to next middleware
        next();
        return;
      })
      .catch((err) => {
        // db fetch error handling
        console.log(err?.message || err, 1);
        res.clearCookie("access_token");
        res.locals.user = null;
        next();
        return;
      });
  } catch (err) {
    // if access token is expired
    let username = null;
    if (err.name === "TokenExpiredError")
      username = jwt.decode(access_token)?.username;
    else {
      res.clearCookie("access_token");
      res.locals.user = null;
      next();
      return;
    }
    if (!username) {
      res.clearCookie("access_token");
      res.locals.user = null;
      next();
      return;
    }
    get_refresh_token(username) // fetch db for refresh token
      .then((refresh_token) => {
        jwt.verify(
          refresh_token,
          process.env.REFRESH_TOKEN_SECRET,
          (err, decoded) => {
            if (err) {
              // if refresh token is expired clear cookie and move to next middleware
              res.clearCookie("access_token");
              res.locals.user = null;
              next();
              return;
            }
            // else gen new access token if refresh token is not expired "refresh"
            const new_access_token = jwt.sign(
              { username },
              process.env.TOKEN_SECRET,
              { expiresIn: 60 }
            );
            sql`select username, encode(pfp, 'base64') as pfp, pfp_mime from users where username = ${username}`
              .then((data) => {
                // fetch db for user pfp so we set user object
                res.cookie("access_token", new_access_token, {
                  httpOnly: true,
                  sameSite: "Lax",
                });
                res.locals.user = data[0];
                next();
                return;
              })
              .catch((err) => {
                // catch db user fetch error
                console.log(err?.message || err, 2);
                res.clearCookie("access_token");
                res.locals.user = null;
                next();
                return;
              });
          }
        );
      })
      .catch((err) => {
        // catch refresh token fetch error
        console.log(err?.message || err, 3);
        res.clearCookie("access_token");
        res.locals.user = null;
        next();
        return;
      });
  }
};

module.exports = auth_middleware;
