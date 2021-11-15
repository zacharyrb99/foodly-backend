"use strict";
const express = require("express");
const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const recipeRoutes = require("./routes/recipes");
const cocktailRoutes = require("./routes/cocktails");

const app = express();

app.use(express.json());
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/recipes", recipeRoutes);
app.use("/cocktails", cocktailRoutes);

// Handle 404 Errors
app.use((req, res, next) => {
    return next(new NotFoundError);
});

// Anything else unhandled goes here
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'test') console.error(err.stack);

    const status = err.status || 500;
    const message = err.message;
    
    return res.status(status).json({
        error: { message, status }
    });
});

module.exports = app;