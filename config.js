"use strict";

require("dotenv").config();
require('colors');

const SECRET_KEY = process.env.SECRET_KEY || 'capstone2';
const PORT = +process.env.PORT || 5000;
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === 'test' ? 1 : 12;

const getDatabaseURI = () => {
    return (process.env.NODE_ENV === 'test')
        ? 'capstone2_test' 
        : process.env.DATABASE_URL || 'capstone2'
};

console.log("Capstone2 Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseURI());
console.log("---");

module.exports = {
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseURI
};