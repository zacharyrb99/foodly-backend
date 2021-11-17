const db = require("../db");
const User = require("../models/user");
const Recipe = require("../models/recipe");
const Cocktail = require("../models/cocktail");
const { createToken } = require("../helpers/token");

const commonBeforeAll = async () => {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM recipes");
    await db.query("DELETE FROM cocktails");

    await Recipe.create({
        id: 1,
        name: "recipe1",
        instructions: "recipe1 instructions",
        img_url: "r1.jpg"
    });

    await Recipe.create({
        id: 2,
        name: "recipe2",
        instructions: "recipe2 instructions",
        img_url: "r2.jpg"
    });

    await Cocktail.create({
        id: 1,
        name: "cocktail1",
        instructions: "cocktail1 instructions",
        img_url: "c1.jpg"
    });

    await Cocktail.create({
        id: 2,
        name: "cocktail2",
        instructions: "cocktail2 instructions",
        img_url: "c2.jpg"
    });

    await User.register({
        username: "u1",
        password: "password1",
        firstName: "test",
        lastName: "user1",
        email: "u1@gmail.com"
    });

    await User.register({
        username: "u2",
        password: "password2",
        firstName: "test",
        lastName: "user2",
        email: "u2@gmail.com"
    });

    await User.saveRecipe("u1", 1);
    await User.saveCocktail("u2", 1);
}

const commonBeforeEach = async () => {
    await db.query("BEGIN");
}

const commonAfterEach = async () => {
    await db.query("ROLLBACK");
}

const commonAfterAll = async () => {
    await db.end();
}

const u1Token = createToken({username: "u1"});
const u2Token = createToken({username: "u2"});

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token
}