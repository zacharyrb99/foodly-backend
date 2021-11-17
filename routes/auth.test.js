const request = require("supertest");
const app = require("../app");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } = require("./_testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// POST /auth/register ********************************************
describe("POST /auth/register", () => {
    test("works", async () => {
        const resp = await request(app).post("/auth/register").send({
            username: "newUser",
            password: "password",
            firstName: "first",
            lastName: "last",
            email: "new@gmail.com"
        });

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({ "token" : expect.any(String) });
    });

    test("bad request for missing fields", async () => {
        const resp = await request(app).post("/auth/register").send({
            username: "newUser"
        });

        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid email", async () => {
        const resp = await request(app).post("/auth/register").send({
            username: "newUser",
            password: "password",
            firstName: "first",
            lastName: "last",
            email: "incorrect-format"
        });

        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid username length", async () => {
        const resp = await request(app).post("/auth/register").send({
            username: "new",
            password: "password",
            firstName: "first",
            lastName: "last",
            email: "new@gmail.com"
        });

        expect(resp.statusCode).toEqual(400);
    });
});

// POST /auth/login ********************************************
describe("POST /auth/login", () => {
    test("works", async () => {
        const resp = await request(app).post("/auth/login").send({
            username: "u1",
            password: "password1"
        });

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ "token" : expect.any(String) });
    });

    test("bad request for invalid format", async () => {
        const resp = await request(app).post("/auth/login").send({
            username: "u1"
        });

        expect(resp.statusCode).toEqual(400);
    });

    test("unauth for incorrect username/password", async () => {
        const resp = await request(app).post("/auth/login").send({
            username: "u1",
            password: "incorrect"
        });

        expect(resp.statusCode).toEqual(401);
    });
});