const bcrypt = require("bcrypt");
const sql = require("../model/db");
require("dotenv").config();
const get_user_login_info = (username) => {
  // get user credentials to compare after login

  return new Promise((resolve, reject) => {
    sql`select password_hash from users where username = ${username};`
      .then((data) => {
        if (data?.length === 1) resolve(data[0].password_hash);
        // if user exists resolve with password_hash
        else reject("The username you entered is wrong 😔"); // no user, reject with null
      })
      .catch((err) => reject(err?.message || err)); // handling db fetch error
  });
};

const verify_user_login = (password, password_hash) => {
  return new Promise((resolve, reject) => {
    bcrypt
      .compare(password, password_hash)
      .then((result) => {
        if (result) resolve(true);
        else reject("The password you entered is wrong 😔");
      })
      .catch((err) => reject(err?.message || err));
  });
};
module.exports = { get_user_login_info, verify_user_login };
