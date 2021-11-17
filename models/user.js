const db = require('../db');
const bcrypt = require('bcrypt');
const { NotFoundError, UnauthorizedError, BadRequestError } = require('../expressError');
const { BCRYPT_WORK_FACTOR } = require('../config');
const { sqlPartialUpdate } = require('../helpers/sql'); 

class User {
    /*
        authenticate user given username & password

        returns {username, firstName, lastName, email}

        throws UnauthorizedError if username & password don't match in database
    */
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

    /*
        register new user given data

        data: {username, password, firstName, lastName, email}

        returns: {username, firstName, lastName, email}

        throws BadRequestError if username is already taken
    */
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

    /*
        gets a user based on given username

        returns {id, username, firstName, lastName, email, savedRecipes, savedCocktails}
            savedRecipes = [recipe ids]
            savedCocktails = [cocktail ids]
        
        throws NotFoundError if username doesn't exist
    */
    static async get (username) {
        const userQuery = await db.query (
            `SELECT id, username, first_name AS "firstName", last_name AS "lastName", email
             FROM users 
             WHERE username = $1`, [username]);
        
        const user = userQuery.rows[0];
        if (!user) throw new NotFoundError(`No User: ${username}`);

        const savedRecipesQuery = await db.query(`SELECT recipe_id FROM saved_recipes WHERE user_id = $1`, [user.id]);
        user.savedRecipes = savedRecipesQuery.rows.map(r => r.recipe_id);

        const savedCocktailsQuery = await db.query(`SELECT cocktail_id FROM saved_cocktails WHERE user_id = $1`, [user.id]);
        user.savedCocktails = savedCocktailsQuery.rows.map(c => c.cocktail_id);

        return user;
    }

    /*
        updates user based on username and given data

        this is a partial update, so you don't need to supply all fields for the given data.
        it will only change the given fields

        data can include: {firstName, lastName, email}
        data must include: {password} for security reasons

        returns: {username, firstName, lastName, email}

        throws NotFoundError if username doesn't exist
        throws UnauthorizedError if given password doesn't match user's password
    */
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

    /*
        Delete user from database given username
    */
    static async remove (username) {
        let result = await db.query(`DELETE FROM users WHERE username = $1 RETURNING username`, [username])
        const user = result.rows[0];
        if (!user) throw new NotFoundError(`No user: ${username}`);
    }

    /*
        save a recipe to user given username and recipeId
    */
    static async saveRecipe (username, recipeId) {
        const recipePreCheck = await db.query(`SELECT id FROM recipes WHERE id = $1`, [recipeId])
        const recipe = recipePreCheck.rows[0];
        if (!recipe) throw new NotFoundError(`No recipe with id: ${recipeId}`);

        const userPreCheck = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
        const user = userPreCheck.rows[0];
        if (!user) throw new NotFoundError(`No user with id: ${username}`);

        await db.query(`INSERT INTO saved_recipes (user_id, recipe_id) VALUES ($1, $2)`, [user.id, recipeId]);
    }

    /*
        save a cocktail to user given username and cocktailId
    */
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