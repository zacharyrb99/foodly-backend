const jsonschema = require('jsonschema');
const express = require('express');
const { BadRequestError } = require('../expressError');
const User = require('../models/user');
const userUpdateSchema = require('../schemas/userUpdate.json');
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");

const router = new express.Router();

/*
    GET /users/:username

    returns data for user given username

    data: {id, username, firstName, lastName, email}

    Authorization: user logged in
*/
router.get('/:username', ensureLoggedIn, async (req, res, next) => {
    try {
        const user = await User.get(req.params.username);
        return res.json({ user });
    } catch (e) {
        return next(e);
    }
});

/*
    PATCH /users/:username

    updates a users data given username and updateData
    
    returns {username, firstName, lastName, email}

    Authorization: same user as :username
*/
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

/*
    DELETE users/:username

    deletes a user based on given username

    returns: {deleted: :username}

    Authorization: same user as :username
*/
router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
    try {
        await User.remove(req.params.username);
        return res.json({deleted: req.params.username});
    } catch (e) {
        return next(e);
    }
});

/*
    POST /users/:username/recipes/:id

    saves a recipe to user given username and recipeId

    returns: {saved: recipeId}

    Authorization: same user as :username
*/
router.post('/:username/recipes/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const recipeId = +req.params.id;
        await User.saveRecipe(req.params.username, recipeId);
        return res.json({saved: recipeId});
    } catch (e) {
        return next(e);
    }
});

/*
    DELETE /users/:username/recipes/:id

    unsaves a recipe to user given username and recipeId

    returns: {unsaved: recipeId}

    Authorization: same user as :username
*/
router.delete('/:username/recipes/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const recipeId = +req.params.id;
        const user = await User.get(req.params.username);
        await User.unsaveRecipe(user.id, recipeId);
        return res.json({unsaved: recipeId});
    } catch (e) {
        return next(e);
    }
});

/*
    POST /users/:username/cocktails/:id

    saves a cocktail to user given username and cocktailId

    returns: {saved: cocktailId}

    Authorization: same user as :username
*/
router.post('/:username/cocktails/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const cocktailId = +req.params.id;
        await User.saveCocktail(req.params.username, cocktailId);
        return res.json({saved: cocktailId});
    } catch (e) {
        return next(e);
    }
});

/*
    DELETE /users/:username/cocktails/:id

    unsaves a cocktail to user given username and cocktailId

    returns: {unsaved: cocktailId}

    Authorization: same user as :username
*/
router.delete('/:username/cocktails/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const cocktailId = +req.params.id;
        const user = await User.get(req.params.username);
        await User.unsaveCocktail(user.id, cocktailId);
        return res.json({unsaved: cocktailId});
    } catch (e) {
        return next(e);
    }
});

module.exports = router;