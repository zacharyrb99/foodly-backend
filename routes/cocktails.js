const jsonschema = require('jsonschema');
const express = require('express');
const { BadRequestError } = require('../expressError');
const Cocktail = require('../models/cocktail');
const cocktailNewSchema = require('../schemas/cocktailsNew.json');
const { ensureLoggedIn } = require("../middleware/auth");

const router = new express.Router();

/*
    POST /cocktails

    body data should be: {id, name, instructions, img_url}
    returns: {id, name, instructions, img_url}

    Authorization: user logged in
*/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, cocktailNewSchema);
        if (!validator.valid) {
            const errors = validator.errors.map(e => e.stack);
            throw new BadRequestError(errors);
        }

        const cocktail = await Cocktail.create(req.body);
        return res.status(201).json({ cocktail });
    } catch (e) {
        return next(e);
    }
});

/*
    GET /cocktails/:id

    gets a cocktail based on given id
    returns: {id, name, instructions, img_url}

    Authorization: user logged in
*/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const cocktail = await Cocktail.get(req.params.id);
        return res.json({ cocktail });
    } catch (e) {
        return next(e);
    }
});

/*
    DELETE /cocktails/:id

    deletes a cocktail based on given id
    returns: {deleted: cocktailId}

    Authorization: user logged in
*/
router.delete('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        await Cocktail.remove(req.params.id);
        return res.json({ deleted: +req.params.id });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;