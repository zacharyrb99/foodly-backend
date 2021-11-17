const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, u1Token } = require("./_testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// GET /users/:username ************************************
describe("GET /users/username", () => {
    test("works", async () => {
        const resp = await request(app).get("/users/u1").set("authorization", `Bearer ${u1Token}`);
        
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ user: {
            id: expect.any(Number),
            username: "u1",
            firstName: "test",
            lastName: "user1",
            email: "u1@gmail.com",
            saved_recipes: [1],
            saved_cocktails: []
        }});
    });

    test("unauth for anon", async () => {
        const resp = await request(app).get("/users/u1");

        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such username", async () => {
        const resp = await request(app).get("/users/incorrect").set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(404);
    });
});

// PATCH /users/:username ************************************
describe("PATCH /users/:username", () => {
    test("works", async () => {
        const resp = await request(app).patch("/users/u1").send({firstName: "new", password: "password1"}).set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ user: {
            username: "u1",
            firstName: "new",
            lastName: "user1",
            email: "u1@gmail.com"
        }});
    });

    test("unauth for not same user", async () => {
        const resp = await request(app).patch("/users/u2").send({firstName: "new", password: "password2"}).set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
    })

    test("unauth for anon user", async () => {
        const resp = await request(app).patch("/users/u1").send({firstName: "new", password: "password1"});

        expect(resp.statusCode).toEqual(401);
    });

    test("bad request for missing password", async () => {
        const resp = await request(app).patch("/users/u1").send({firstName: "new"}).set("authorization", `Bearer ${u1Token}`);
        
        expect(resp.statusCode).toEqual(400);
    });
});


// DELETE /users/:username ************************************
describe("DELETE /users/:username", () => {
    test("works", async () => {
        const resp = await request(app).delete("/users/u1").set("authorization", `Bearer ${u1Token}`);

        expect(resp.body).toEqual({deleted: "u1"});
    });

    test("unauth for anon", async () => {
        const resp = await request(app).delete("/users/u1");

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for not same user", async () => {
        const resp = await request(app).delete("/users/u2").set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
    });
});

// POST /users/:username/recipes/:id ************************************
describe("POST /users/:username/recipes/:id", () => {
    test("works", async () => {
        const resp = await request(app).post("/users/u1/recipes/2").set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({saved: 2}); 
    });

    test("unauth for anon", async () => {
        const resp = await request(app).post("/users/u2/recipes/1");

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for not same user", async () => {
        const resp = await request(app).post("/users/u2/recipes/1").set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such recipe", async () => {
        const resp = await request(app).post("/users/u1/recipes/0").set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(404);
    });
});

// POST /users/:username/cocktails/:id ************************************
describe("POST /users/:username/cocktails/:id", () => {
    test("works", async () => {
        const resp = await request(app).post("/users/u1/cocktails/2").set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({saved: 2}); 
    });

    test("unauth for anon", async () => {
        const resp = await request(app).post("/users/u2/cocktails/1");

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for not same user", async () => {
        const resp = await request(app).post("/users/u2/cocktails/1").set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such recipe", async () => {
        const resp = await request(app).post("/users/u1/cocktails/0").set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(404);
    });
});
