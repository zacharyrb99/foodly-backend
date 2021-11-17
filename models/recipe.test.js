const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const Recipe = require("../models/recipe");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } = require("./_testCommonModels");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// CREATE **************************************************
describe("create", () => {
    const newRecipe = {
        id: 3,
        name: "New Recipe",
        instructions: "New Recipe Instructions",
        img_url: "r3.jpg"
    }

    test("works", async () => {
        const recipe = await Recipe.create(newRecipe);
        expect(recipe).toEqual(newRecipe);

        const res = await db.query(`SELECT * FROM recipes WHERE id = 3`);
        expect(res.rows[0]).toEqual(newRecipe);
    });

    test("bad request for duplicate recipe", async () => {
        try {
            await Recipe.create(newRecipe);
            await Recipe.create(newRecipe);
            fail();
        } catch (e) {
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    });
});

// GET **************************************************
describe("get", () => {
    test("works", async () => {
        const recipe = await Recipe.get(1);
        expect(recipe).toEqual({
            id: 1,
            name: "recipe1",
            instructions: "recipe1 instructions",
            img_url: "r1.jpg"
        });
    });

    test("not found for no such id", async () => {
        try {
            const recipe = await Recipe.get(0);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});

// REMOVE **************************************************
describe("remove", () => {
    test("works", async () => {
        const preDelete = await db.query(`SELECT * FROM recipes WHERE id = 1`);
        expect(preDelete.rows.length).toEqual(1);

        await Recipe.remove(1);

        const postDelete = await db.query(`SELECT * FROM recipes WHERE id = 1`);
        expect(postDelete.rows.length).toEqual(0);
    });

    test("not found for no such id", async () => {
        try {
            await Recipe.remove(0);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});