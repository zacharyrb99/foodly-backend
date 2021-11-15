const bcrypt = require("bcrypt");
const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testUserIds = [];
const testRecipeIds = [];
const testCocktailIds = [];

const commonBeforeAll = async () => {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM recipes");
    await db.query("DELETE FROM cocktails");

    const userRes = await db.query(`
        INSERT INTO users (username, password, firstName, lastName, email) 
        VALUES ('u1', $1, 'test', 'user1', 'u1@gmail.com') 
               ('u2', $2, 'test', 'user2', 'u2@gmail.com')
        RETURNING id`, [
            await bcrypt.hash('password1', BCRYPT_WORK_FACTOR),
            await bcrypt.hash('password2', BCRYPT_WORK_FACTOR)
        ]
    );

    testUserIds.splice(0, 0, ...userRes.rows.map(u => u.id));
    
    const recipeRes = await db.query(`
        INSERT INTO recipes (id, name, instructions, img_url) 
        VALUES (1, 'recipe1', 'recipe1 instructions', 'r1.jpg') 
               (2, 'recipe2', 'recipe2 instructions', 'r2.jpg') 
        RETURNING id`);

    testRecipeIds.splice(0, 0, ...recipeRes.rows.map(r => r.id));

    const cocktailRes = await db.query(`
        INSERT INTO cocktails (id, name, instructions, img_url) 
        VALUES (1, 'cocktail1', 'cocktail1 instructions', 'c1.jpg') 
               (1, 'cocktail1', 'cocktail1 instructions', 'c1.jpg')
        RETURNING id`);
    
    testCocktailIds.splice(0, 0, ...cocktailRes.rows.map(c => c.id));

    await db.query(`INSERT INTO saved_recipes (user_id, recipe_id) VALUES ($1, $2)`, [testUserIds[0], testRecipeIds[0]]);
    await db.query(`INSERT INTO saved_cocktails (user_id, cocktail_id) VALUES ($1, $2)`, [testUserIds[1], testCocktailIds[0]]);
}

const commonBeforeEach = async () => await db.query("BEGIN");
const commonAfterEach = async () => await db.query("ROLLBACK");
const commonAfterAll = async () => await db.end();

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testCocktailIds,
    testRecipeIds,
    testUserIds
};