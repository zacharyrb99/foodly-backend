const db = require('../db');
const { NotFoundError, BadRequestError } = require('../expressError');

class Cocktail {
    /*
        Create a cocktail, update db, return new cocktail

        data: {id, name, instructions, img_url}

        returns: {id, name, instructions, img_url}

        throws BadRequestError if cocktail already exists
    */
    static async create (data) {
        const duplicateCheck = await db.query(`SELECT name FROM cocktails WHERE name = $1`, [data.name]);
        if (duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate Cocktail: ${data.name}`);

        const result = await db.query(
            `INSERT INTO cocktails (id, name, instructions, img_url) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, name, instructions, img_url`, 
             [data.id, data.name, data.instructions, data.img_url]);
        
        const cocktail = result.rows[0];
        return cocktail;
    }

    /*
        Get a single cocktail given it's id, returns cocktail data

        returns {id, name, instructions, img_url}

        throws NotFoundError if cocktail doesn't exist
    */
    static async get (id) {
        const cocktailRes = await db.query(`SELECT id, name, instructions, img_url FROM cocktails WHERE id = $1`, [id]);
        const cocktail = cocktailRes.rows[0];
        
        if(!cocktail) throw new NotFoundError(`No cocktail with id: ${id}`);

        return cocktail;
    }

    /*
        Delete a cocktail given it's id

        throws NotFoundError if cocktail doesn't exist
    */
    static async remove (id) {
        const res = await db.query(`DELETE FROM cocktails WHERE id = $1 RETURNING id`, [id]);
        const cocktail = res.rows[0];

        if(!cocktail) throw new NotFoundError(`No cocktail with id: ${id}`);
    }
}

module.exports = Cocktail;