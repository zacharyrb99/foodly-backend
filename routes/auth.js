const express = require("express");
const router = new express.Router();
const User = require('../models/user');
const jsonschema = require('jsonschema');
const { createToken } = require('../helpers/token');
const userAuthSchema = require('../schemas/userAuth.json');
const userNewSchema = require('../schemas/userNew.json');
const { BadRequestError } = require('../expressError');

/* 
    POST /auth/register: {username, password, firstName, lastName, email} => {token}

    Returns token that allows you to authenticate future requests

    Authorization required: None
*/

router.post("/register", async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, userNewSchema);
        if (!validator.valid) {
            const errors = validator.errors.map(e => e.stack);
            throw new BadRequestError(errors);
        }

        const newUser = await User.register( req.body );
        const token = createToken(newUser);
        return res.status(201).json({ token });
    } catch (e) {
        return next(e);
    }
});

/*
    POST /auth/login: {username, password} => {token}

    Returns token that allows you to authenticate future requests

    Authorization required: None
*/

router.post("/login", async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, userAuthSchema);
        if (!validator.valid) {
            const errors = validator.errors.map(e => e.stack);
            throw new BadRequestError(errors);
        }

        const user = await User.authenticate( req.body.username, req.body.password );
        const token = createToken(user);
        return res.json({ token });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;