const request = require("supertest");
const app = require("../app");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, u1Token } = require("./_testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// POST /cocktails **********************************************
describe("POST /cocktails", () => {
    const newCocktail = {
        id: 15,
        name: "newCocktail",
        instructions: "newCocktail instructions",
        img_url: "newC.jpg"
    }

    test("works", async () => {
        const resp = await request(app).post("/cocktails").send(newCocktail).set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            cocktail: newCocktail
        })
    });

    test("unauth for anon user", async () => {
        const resp = await request(app).post("/cocktails").send(newCocktail);

        expect(resp.statusCode).toEqual(401);
    });

    test("bad request for missing data", async () => {
        const resp = await request(app).post("/cocktails").send(
            {
                name: "missingData"
            }
        ).set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(400);
    });
});

// GET /cocktails/:id **********************************************
describe("GET /cocktails/:id", () => {
    test("works", async () => {
        const resp = await request(app).get("/cocktails/1").set("authorization", `Bearer ${u1Token}`);
        
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ 
            cocktail: {
                id: 1,
                name: "cocktail1",
                instructions: "cocktail1 instructions",
                img_url: "c1.jpg"
            }});
    });

    test("unauth for anon user", async () => {
        const resp = await request(app).get("/cocktails/1");

        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such cocktail", async () => {
        const resp = await request(app).get("/cocktails/0").set("authorization", `Bearer ${u1Token}`);
        
        expect(resp.statusCode).toEqual(404);
    });
});