const db = require('../db');
const { NotFoundError } = require('../expressError');

class Cocktail {
    static async create (data) {
        const result = await db.query(
            `INSERT INTO cocktails (id, name, instructions, img_url) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, name, instructions, img_url`, 
             [data.id, data.name, data.instructions, data.img_url]);
        
            const cocktail = result.rows[0];
            return cocktail;
    }

    static async get (id) {
        const result = await db.query(`SELECT id, name, instructions, img_url FROM cocktails WHERE id = $1`, [id]);
        const cocktail = result.rows[0];
        
        if(!cocktail) throw new NotFoundError(`No cocktail with id: ${id}`);

        return cocktail;
    }

    static async remove (id) {
        const result = await db.query(`DELETE FROM cocktails WHERE id = $1 RETURNING id`, [id]);
        const cocktail = result.rows[0];

        if(!cocktail) throw new NotFoundError(`No cocktail with id: ${id}`);
    }
}

module.exports = Cocktail;