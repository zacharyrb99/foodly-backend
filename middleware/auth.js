const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { UnauthorizedError } = require('../expressError');

const authenticateJWT = (req, res, next) => {
    try {
        const authHeader = req.headers && req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals.user = jwt.verify(token, SECRET_KEY);
        }

        return next();
    } catch (e) {
        return next();
    }
}

const ensureLoggedIn = (req, res, next) => {
    try {
        if (!res.locals.user) throw new UnauthorizedError();
        return next();
    } catch (e) {
        return next(e);
    }
}

const ensureCorrectUser = (req, res, next) => {
    try {
        const user = res.locals.user;
        if (!(user && user.username === req.params.username)) {
            throw new UnauthorizedError();
        }

        return next();
    } catch (e) {
        return next(e);
    }
}

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUser
}