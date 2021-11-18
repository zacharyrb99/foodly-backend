const db = require('../db');
const { NotFoundError, BadRequestError } = require('../expressError');

class Recipe {
    /*
        Create a recipe, update db, return new recipe

        data: {id, name, instructions, img_url}

        returns: {id, name, instructions, img_url}

        throws BadRequestError if recipe already exists
    */
    static async create (data) {
        const duplicateCheck = await db.query(`SELECT name FROM recipes WHERE name = $1`, [data.name]);
        if (duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate Recipe: ${data.name}`);

        const result = await db.query(
            `INSERT INTO recipes (id, name, instructions, img_url) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, name, instructions, img_url`, 
             [data.id, data.name, data.instructions, data.img_url]);
        
        const recipe = result.rows[0];
        return recipe;
    }

    /*
        Get a single recipe given it's id, returns recipe data

        returns {id, name, instructions, img_url}

        throws NotFoundError if recipe doesn't exist
    */
    static async get (id) {
        const recipeRes = await db.query(`SELECT id, name, instructions, img_url FROM recipes WHERE id = $1`, [id]);
        const recipe = recipeRes.rows[0];
        
        if(!recipe) throw new NotFoundError(`No recipe with id: ${id}`);

        return recipe;
    }
}

module.exports = Recipe;