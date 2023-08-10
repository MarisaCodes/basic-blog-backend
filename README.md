# Basic Blog Backend (Basic Blog - Astro.js)

- [Database Schema](#database-schema)
- [Server overview](#server-overview)
- [Auth](#authorization)

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
    slug TEXT NOT NULL,
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
```

Note: `CookieParser` is invoked from an npm package `npm install cookie-parser`.

## Authorization

I have decided to make use of `jsonwebtoken` for this project. `npm install jsonwebtoken`.
Two tokens are created on signup, an access token that is set as an `httpOnly` cookie and a refresh token that is stored in the database to refresh the access token whenever it expires for a specific duration. The refresh token expires after the access token. This is (arguably) safer than storing the cookie in session or local storage because the vulnerability to XSS attacks would be higher. However, setting `httpOnly` cookies still makes you vulnerable to XSRF attacks. I plan to mitigate this later on when I make the frontend by using a naive double cookie submit technique, but I will only send an addtional token in the `authorization` header of the requests rather than using another cookie which is pointless against XSRF.
