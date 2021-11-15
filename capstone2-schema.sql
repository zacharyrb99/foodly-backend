CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL CHECK (position('@' IN email) > 1)
);

CREATE TABLE recipes (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    instructions TEXT NOT NULL,
    img_url TEXT
);

CREATE TABLE cocktails (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    instructions TEXT NOT NULL,
    img_url TEXT 
);

CREATE TABLE saved_recipes (
    user_id INTEGER REFERENCES users ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes ON DELETE CASCADE,
    PRIMARY KEY (user_id, recipe_id) 
);

CREATE TABLE saved_cocktails (
    user_id INTEGER REFERENCES users ON DELETE CASCADE,
    cocktail_id INTEGER REFERENCES cocktails ON DELETE CASCADE,
    PRIMARY KEY (user_id, cocktail_id)
);