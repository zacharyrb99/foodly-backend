const jsonschema = require('jsonschema');
const express = require('express');
const { BadRequestError } = require('../expressError');
const User = require('../models/user');
const userUpdateSchema = require('../schemas/userUpdate.json');
const { ensureCorrectUser } = require("../middleware/auth");

const router = new express.Router();

router.get('/:username', ensureCorrectUser, async (req, res, next) => {
    try {
        console.log(res.locals.user);
        const user = await User.get(req.params.username);
        return res.json({ user });
    } catch (e) {
        return next(e);
    }
});

router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
            const errors = validator.errors.map(e => e.stack);
            throw new BadRequestError(errors);
        }

        const user = await User.update(req.params.username, req.body);
        return res.json({ user });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
    try {
        await User.remove(req.params.username);
        return res.json({deleted: req.params.username});
    } catch (e) {
        return next(e);
    }
});

router.post('/:username/recipes/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const recipeId = +req.params.id;
        await User.saveRecipe(req.params.username, recipeId);
        return res.json({saved: recipeId});
    } catch (e) {
        return next(e);
    }
});

router.post('/:username/cocktails/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const cocktailId = +req.params.id;
        await User.saveCocktail(req.params.username, cocktailId);
        return res.json({saved: cocktailId});
    } catch (e) {
        return next(e);
    }
});

module.exports = router;