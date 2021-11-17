const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");
const db = require("../db");
const User = require("../models/user");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testUserIds, testRecipeIds, testCocktailIds } = require("./_testCommonModels");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// AUTHENTICATE ************************************************************************************

describe("authenticate", () => {
    test("works", async () => {
        const user = await User.authenticate("u1", "password1");
        expect(user).toEqual({
            username: "u1",
            firstName: "test",
            lastName: "user1",
            email: "u1@gmail.com"
        });
    });

    test("unauth if no such user", async () => {
        try {
            const user = await User.authenticate("u3", "password3");
            fail();
        } catch (e) {
            expect(e instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("unauth if incorrect password", async () => {
        try {
            const user = await User.authenticate("u1", "wrongPassword");
            fail();
        } catch (e) {
            expect(e instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

// REGISTER ************************************************************************************

describe("register", () => {
    const newUser = {
        username: "newUser",
        firstName: "newTest",
        lastName: "user",
        email: "test@gmail.com"
    };

    test("works", async () => {
        let user = await User.register({...newUser, password: "password"});
        expect(user).toEqual(newUser);

        const foundUser = await db.query("SELECT * FROM users WHERE username = 'newUser'");

        expect(foundUser.rows.length).toEqual(1);
        expect(foundUser.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("bad request with duplicate user", async () => {
        try {
            await User.register({...newUser, password: "password"});
            await User.register({...newUser, password: "password"});
            fail();
        } catch (e) {
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    });
});

// GET ************************************************************************************

describe("get", () => {
    test("works", async () => {
        let user = await User.get("u1");
        expect(user).toEqual({
            id: expect.any(Number),
            username: "u1",
            firstName: "test",
            lastName: "user1",
            email: "u1@gmail.com",
            saved_recipes: [1],
            saved_cocktails: []
        });
    });

    test("not found for no such user", async () => {
        try {
            let user = await User.get("wrongUsername");
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});

// UPDATE ************************************************************************************

describe("update", () => {
    const updateDataCorrect = {
        firstName: "newF",
        lastName: "newL",
        email: "new@gmail.com",
        password: "password1"
    };

    const updateDataIncorrect = {
        firstName: "newF",
        lastName: "newL",
        email: "new@gmail.com",
        password: "password2"
    }

    test("works", async () => {
        let updatedUser = await User.update("u1", updateDataCorrect);
        expect(updatedUser).toEqual({
            username: "u1",
            firstName: "newF",
            lastName: "newL",
            email: "new@gmail.com"
        });
    });

    test("unauth for incorrect password", async () => {
        try {
            let updatedUser = await User.update("u1", updateDataIncorrect);
            fail();
        } catch (e) {
            expect(e instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("not found for no such username", async () => {
        try {
            await User.update("incorrectUsername", updateDataCorrect);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        } 
    });
});

// REMOVE ************************************************************************************

describe("remove", () => {
    test("works", async () => {
        const preDelete = await db.query("SELECT * FROM users WHERE username = 'u1'");
        expect(preDelete.rows.length).toEqual(1);

        await User.remove("u1");
        
        const postDelete = await db.query("SELECT * FROM users WHERE username = 'u1'");
        expect(postDelete.rows.length).toEqual(0); 
    });

    test("not found for no such user", async () => {
        try {
            await User.remove("u3");
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});

// SAVE RECIPE ************************************************************************************

describe("save recipe", () => {
    test("works", async () => {
        await User.saveRecipe("u2", testRecipeIds[1]);
        const res = await db.query("SELECT * FROM saved_recipes WHERE user_id = $1", [testUserIds[1]]);
        expect(res.rows).toEqual([{
            user_id: testUserIds[1],
            recipe_id: testRecipeIds[1]
        }]);
    });

    test("not found for no such recipe", async () => {
        try {
            await User.saveRecipe("u1", 0);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });

    test("not found for no such user", async () => {
        try {
            await User.saveRecipe("wrongUsername", testRecipeIds[0]);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});

// SAVE COCKTAIL ************************************************************************************

describe("save cocktail", () => {
    test("works", async () => {
        await User.saveCocktail("u1", testCocktailIds[1]);
        const res = await db.query("SELECT * FROM saved_cocktails WHERE user_id = $1", [testUserIds[0]]);
        expect(res.rows).toEqual([{
            user_id: testUserIds[0],
            cocktail_id: testCocktailIds[1]
        }]);
    });

    test("not found for no such recipe", async () => {
        try {
            await User.saveRecipe("u1", 0);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });

    test("not found for no such user", async () => {
        try {
            await User.saveRecipe("wrongUsername", testCocktailIds[0]);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});