const jwt = require("jsonwebtoken");
const sql = require("../model/db");

require("dotenv").config();

// helper function to get refresh token
const get_refresh_token = async (username) => {
  return new Promise((resolve, reject) => {
    sql`select refresh_token from users where username = ${username};`
      .then((data) => {
        if (data?.length) resolve(data[0].refresh_token);
        else reject(null);
      })
      .catch((err) => reject(err.message || err, 0));
  });
};
// authentication middleware (checking token validity on every server request)
const auth_middleware = (req, res, next) => {
  const access_token = req.cookies?.access_token;
  if (!access_token) {
    res.clearCookie("token");
    res.locals.user = null;
    next();
    return;
  }
  try {
    const decoded_access = jwt.verify(access_token, process.env.TOKEN_SECRET);
    const username = decoded_access.username;
    sql`select username, encode(pfp, 'base64') as pfp, pfp_mime from users where username = ${username};`
      .then((data) => {
        res.locals.user = data;
        next();
        return;
      })
      .catch((err) => {
        console.log(err.message || err, 1);
        res.clearCookie("access_token");
        res.locals.user = null;
        next();
        return;
      });
  } catch (err) {
    const username = req.body?.username;
    get_refresh_token(username)
      .then((refresh_token) => {
        jwt.verify(
          refresh_token,
          process.env.REFRESH_TOKEN_SECRET,
          (err, decoded) => {
            if (err) {
              res.clearCookie("access_token");
              res.locals.user = null;
              next();
              return;
            }
            // gen new access token
            const new_access_token = jwt.sign(
              { username },
              process.env.TOKEN_SECRET,
              { expiresIn: 60 }
            );
            sql`select username, encode(pfp, 'base64') as pfp, pfp_mime from users where username = ${username}`
              .then((data) => {
                res.cookie("access_token", new_access_token, {
                  httpOnly: true,
                  sameSite: "Lax",
                });
                res.locals.user = data;
                next();
                return;
              })
              .catch((err) => {
                console.log(err.message || err, 2);
                res.clearCookie("access_token");
                res.locals.user = null;
                next();
                return;
              });
          }
        );
      })
      .catch((err) => {
        console.log(err.message || err, 3);
        res.clearCookie("access_token");
        res.locals.user = null;
        next();
        return;
      });
  }
};

module.exports = auth_middleware;
