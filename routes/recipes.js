const jsonschema = require('jsonschema');
const express = require('express');
const { BadRequestError } = require('../expressError');
const Recipe = require('../models/recipe');
const recipeNewSchema = require('../schemas/recipeNew.json');
const { ensureLoggedIn } = require('../middleware/auth');

const router = new express.Router();

router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, recipeNewSchema);
        if (!validator.valid) {
            const errors = validator.errors.map(e => e.stack);
            throw new BadRequestError(errors);
        }

        const recipe = await Recipe.create(req.body);
        return res.status(201).json({ recipe });
    } catch (e) {
        return next(e);
    }
});

router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const recipe = await Recipe.get(req.params.id);
        return res.json({ recipe });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        await Recipe.remove(req.params.id);
        return res.json({ deleted: +req.params.id });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;