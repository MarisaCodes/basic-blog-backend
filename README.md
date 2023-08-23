# Basic Blog Backend (Frontend: [basic-blog-react](https://github.com/MarisaCodes/basic-blog-react))

- [Database Schema](#database-schema)
- [Server overview](#server-overview)
- [Auth](#authorization)
- [Postman](#postman)
- [References](#references)

## Database Schema

The database schema or model can be found in `/model/basic-blog-dev.session.sql` file. The schema looks as follows:

```sql
CREATE TABLE users (
    id SERIAL NOT NULL PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    pfp BYTEA NOT NULL DEFAULT decode('somedefaultbase64', 'base64'),
    pfp_mime TEXT NOT NULL DEFAULT 'image/png',
    -- the default base64 image I used has this mimetype
    about TEXT,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    refresh_token TEXT
);
CREATE TABLE blogs (
    id SERIAL NOT NULL PRIMARY KEY,
    content TEXT NOT NULL,
    title TEXT NOT NULL,
    author_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_author_id FOREIGN KEY(author_id) REFERENCES users(id)
);
```

The profile picture of users are stored as `BYTEA` datatype. This is just binary decoded from a base64 image that I encode as base64 when I query the database. It is more adequate to use the file system for storing files but these profile pictures are resized using the `npm` module `sharp`. There are also other problems with using `fs` when you're deploying serverless and I have discussed it thoroughly here: [Basic Blog - ejs.](https://github.com/MarisaCodes/basic-blog#postgresql-db-structure)

## Server Overview

A nodejs server using `express`.

```js
const express = require("express");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
```

Some middleware for development purposes like `morgan` to output logs of server requests and responses for debugging issues and just improving the overall ease of development.

The actual functions that handle user requests and respond to those requests are in the controllers folder. The routers folder makes use of `express.Router()` to create a mini app within the file and handle user requests to the specified routes.

Some important middleware functions I am using:

```js
...
app.use(express.json()) // to parse json body in request
app.use(cookieParser()) // to parse cookies
...
const upload = multer({ storage: multer.memoryStorage() })
route.post("/signup", upload.single("pfp"), (req, res, next) => {
    // multer stores the uploaded file in req.file
    // "pfp" is the name of the file upload form field
    // req.file.buffer for e.g. has the file buffer
    // req.file.mimetype has the mime-type of the file
    // req.body is any text field in the form field if there were any
})
...
```

`CookieParser` is invoked from an npm package:

```
npm install cookie-parser
```

`multer` package:

```
npm install multer
```

Everything else in the server is quite standard I feel. Users can update,delete, and edit/patch their blog posts. I have included only the parts that were slightly new to me and that I felt the need to document. My code is commented as well so I will use that as reference for the "standard: stuff.

## Authorization

I have setup the frontend signup and login such that the request headers will include an authorization header:

```js
// ...code
const headers = new Headers();
headers.set("Authorization", "Basic " + btoa(`${username}:${password}`));
fetch("/api/signup", { method: "POST", headers: headers }).then().catch();
//...code
```

I have decided to make use of `jsonwebtoken` for this project:

```
npm install jsonwebtoken
```

Two tokens are created on signup, an access token that is set as an `httpOnly` cookie (gets sent with every request from the frontend and every response from the backend with setting `{credentials:"include"}` fetch option in the frontend with every API call that needs the cookie) and a refresh token that is stored in the database to refresh the access token whenever it expires for a specific duration. The refresh token expires after the access token. This is (arguably) safer than storing the cookie in session or local storage because the vulnerability to XSS attacks would be higher. However, setting `httpOnly` cookies still makes you vulnerable to XSRF attacks. I use `cors`:

```
npm install cors
```

and

```js
require("dotenv").config();

//...code

app.use(cors({ origin: process.env.ORIGIN, credentials: true }));

// ...code
```

Note: for password hashing I have used `bcrypt`:

```
npm install bcrypt
```

## Postman

Postman was used for testing the REST API routes. It is useful for testing your routes and how you handle common errors too before you build your actual frontend. While I was building the react frontend meanwhile I used postman since the frontend is still incomplete and it has its own issues.

### References

---

- [json web tokens npm](https://www.npmjs.com/package/jsonwebtoken)
- [password hashing with bcrypt](https://blog.logrocket.com/password-hashing-node-js-bcrypt/#:~:text=It%20is%20important%20to%20salt,that%20makes%20the%20hash%20unpredictable.)
- [bcrypt npm](https://www.npmjs.com/package/bcrypt?activeTab=readme)
- [multer npm](https://www.npmjs.com/package/multer)
