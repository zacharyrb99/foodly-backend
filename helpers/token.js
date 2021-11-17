const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

/** return signed JWT from user data. */

const createToken = user => {
    let payload = {
        username: user.username,
    }

    return jwt.sign(payload, SECRET_KEY);
}

module.exports = {createToken};