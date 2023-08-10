-- DB SCHEMA/ PostgreSQL/ using SQLTOOLS vscode
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
-- SQLTOOLS automatically checks whether table exists so no need for IF NOT EXISTS
-- used default base64 encoded png. The base64 string is in ./bs64.png