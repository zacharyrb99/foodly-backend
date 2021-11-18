const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const Cocktail = require("../models/cocktail");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } = require("./_testCommonModels");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// CREATE ********************************************
describe("create", () => {
    const newCocktail = {
        id: 3,
        name: "New Cocktail",
        instructions: "New Cocktail Instructions",
        img_url: "c3.jpg"
    }

    test("works", async () => {
        const cocktail = await Cocktail.create(newCocktail);
        expect(cocktail).toEqual(newCocktail);

        const res = await db.query(`SELECT * FROM cocktails WHERE id = 3`);
        expect(res.rows[0]).toEqual(newCocktail);
    });

    test("bad request for duplicate recipe", async () => {
        try {
            await Cocktail.create(newCocktail);
            await Cocktail.create(newCocktail);
            fail();
        } catch (e) {
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    });
});

// GET ********************************************
describe("get", () => {
    test("works", async () => {
        const cocktail = await Cocktail.get(1);
        expect(cocktail).toEqual({
            id: 1,
            name: "cocktail1",
            instructions: "cocktail1 instructions",
            img_url: "c1.jpg"
        });
    });

    test("not found for no such id", async () => {
        try {
            const cocktail = await Cocktail.get(0);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});