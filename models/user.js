const db = require('../db');
const bcrypt = require('bcrypt');
const { NotFoundError, UnauthorizedError, BadRequestError } = require('../expressError');
const { BCRYPT_WORK_FACTOR } = require('../config');
const { sqlPartialUpdate } = require('../helpers/sql'); 

class User {
    static async authenticate (username, password) {
        const res = await db.query(
            `SELECT username, 
                    password, 
                    first_name AS "firstName",
                    last_name AS "lastName", 
                    email 
            FROM users 
            WHERE username = $1`, [username]);

        const user = res.rows[0];
        
        if (user) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError("Invalid username/password");
    }

    static async register ({username, password, firstName, lastName, email}) {
        const duplicateCheck = await db.query(
            `SELECT username 
            FROM users 
            WHERE username = $1`, [username]);

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`${username} is already taken, try a different one.`);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const res = await db.query(
            `INSERT INTO users 
            (username, password, first_name, last_name, email)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING username, first_name AS "firstName", last_name AS "lastName", email`, 
            [username, hashedPassword, firstName, lastName, email]);

        const user = res.rows[0];
        return user;
    }

    static async get (username) {
        const userQuery = await db.query (
            `SELECT id, username, first_name AS "firstName", last_name AS "lastName", email
             FROM users 
             WHERE username = $1`, [username]);
        
        const user = userQuery.rows[0];
        if (!user) throw new NotFoundError(`No User: ${username}`);

        const savedRecipesQuery = await db.query(`SELECT recipe_id FROM saved_recipes WHERE user_id = $1`, [user.id]);
        user.saved_recipes = savedRecipesQuery.rows.map(r => r.recipe_id);

        const savedCocktailsQuery = await db.query(`SELECT cocktail_id FROM saved_cocktails WHERE user_id = $1`, [user.id]);
        user.saved_cocktails = savedCocktailsQuery.rows.map(c => c.cocktail_id);

        return user;
    }

    static async update (username, userData) {
        const userPassword = await db.query(`SELECT password FROM users WHERE username = $1`, [username]);
        if (userPassword.rows.length == 0) throw new NotFoundError(`No user: ${username}`);

        const passwordCheck = await bcrypt.compare(userData.password, userPassword.rows[0].password)

        if (!passwordCheck) throw new UnauthorizedError("Invalid username/password.");

        const { setColumns, values } = sqlPartialUpdate(
            userData, 
            {
                firstName: "first_name",
                lastName: "last_name"
            });

        const usernameIndex = "$" + (values.length + 1);

        const sql = `UPDATE users 
                     SET ${setColumns} 
                     WHERE username = ${usernameIndex} 
                     RETURNING username, first_name AS "firstName", last_name AS "lastName", email`;
        
        const result = await db.query(sql, [...values, username]);
        const user = result.rows[0];

        delete user.password;
        return user;
    }

    static async remove (username) {
        let result = await db.query(`DELETE FROM users WHERE username = $1 RETURNING username`, [username])
        const user = result.rows[0];
        if (!user) throw new NotFoundError(`No user: ${username}`);
    }

    static async saveRecipe (username, recipeId) {
        const recipePreCheck = await db.query(`SELECT id FROM recipes WHERE id = $1`, [recipeId])
        const recipe = recipePreCheck.rows[0];
        if (!recipe) throw new NotFoundError(`No recipe with id: ${recipeId}`);

        const userPreCheck = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
        const user = userPreCheck.rows[0];
        if (!user) throw new NotFoundError(`No user with id: ${username}`);

        await db.query(`INSERT INTO saved_recipes (user_id, recipe_id) VALUES ($1, $2)`, [user.id, recipeId]);
    }

    static async saveCocktail(username, cocktailId) {
        const cocktailPreCheck = await db.query(`SELECT id FROM cocktails WHERE id = $1`, [cocktailId]);
        const cocktail = cocktailPreCheck.rows[0];
        if (!cocktail) throw new NotFoundError(`No cocktail with id: ${cocktailId}`);

        const userPreCheck = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
        const user = userPreCheck.rows[0];
        if (!user) throw new NotFoundError(`No user with id: ${username}`);

        await db.query(`INSERT INTO saved_cocktails (user_id, cocktail_id) VALUES ($1, $2)`, [user.id, cocktailId]);
    }
}

module.exports = User;