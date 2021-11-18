const request = require("supertest");
const app = require("../app");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, u1Token } = require("./_testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// POST /recipes **********************************************
describe("POST /recipes", () => {
    const newRecipe = {
        id: 15,
        name: "newRecipe",
        instructions: "newRecipe instructions",
        img_url: "newR.jpg"
    }

    test("works", async () => {
        const resp = await request(app).post("/recipes").send(newRecipe).set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            recipe: newRecipe
        })
    });

    test("unauth for anon user", async () => {
        const resp = await request(app).post("/recipes").send(newRecipe);

        expect(resp.statusCode).toEqual(401);
    });

    test("bad request for missing data", async () => {
        const resp = await request(app).post("/recipes").send(
            {
                name: "missingData"
            }
        ).set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(400);
    });
});

// GET /recipes/:id **********************************************
describe("GET /recipes/:id", () => {
    test("works", async () => {
        const resp = await request(app).get("/recipes/1").set("authorization", `Bearer ${u1Token}`);
        
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ 
            recipe: {
                id: 1,
                name: "recipe1",
                instructions: "recipe1 instructions",
                img_url: "r1.jpg"
            }});
    });

    test("unauth for anon user", async () => {
        const resp = await request(app).get("/recipes/1");

        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such cocktail", async () => {
        const resp = await request(app).get("/recipes/0").set("authorization", `Bearer ${u1Token}`);
        
        expect(resp.statusCode).toEqual(404);
    });
});