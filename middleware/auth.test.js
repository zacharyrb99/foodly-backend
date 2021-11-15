const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
    authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUser
} = require("./auth");

const { SECRET_KEY } = require("../config");
const testJwtCorrect = jwt.sign({ username: "test" }, SECRET_KEY);
const testJwtIncorrect = jwt.sign({ username: "test" }, "wrongKey");

describe("authenticateJWT", () => {
    test("works: valid token", () => {
        const req = { headers: { authorization: `Bearer ${testJwtCorrect}` } };
        const res = { locals: {} };
        const next = e => expect(e).toBeFalsy();

        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({
            user: {
                iat: expect.any(Number),
                username: "test"
            }
        });
    });

    test("works: invalid token", () => {
        const req = { headers: { authorization: `Bearer ${testJwtIncorrect}` } };
        const res = { locals: {} };
        const next = e => expect(e).toBeFalsy();

        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });

    test("work: no header", () => {
        const req = {};
        const res = { locals: {} };
        const next = e => expect(e).toBeFalsy();

        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
});

describe("ensureLoggedIn", () => {
    test("works", () => {
        const req = {};
        const res = { locals: { user: { username: "test" } } };
        const next = e => expect(e).toBeFalsy();

        ensureLoggedIn(req, res, next);
    });

    test("unauth error if no login", () => {
        const req = {};
        const res = { locals: {} };
        const next = e => expect(e instanceof UnauthorizedError).toBeTruthy();

        ensureLoggedIn(req, res, next);
    });
});

describe("ensureCorrectUser", () => {
    test("works: same user", () => {
        const req = { params: { username: "test" } };
        const res = { locals: { user: { username: "test" } } };
        const next = e => expect(e).toBeFalsy();

        ensureCorrectUser(req, res, next);
    });

    test("unauth: different user", () => {
        const req = { params: { username: "test"} };
        const res = { locals: { user: { username: "test1" } } };
        const next = e => expect(e instanceof UnauthorizedError).toBeTruthy();

        ensureCorrectUser(req, res, next);
    });

    test("unauth: no user", () => {
        const req = { params: { username: "test" } };
        const res = { locals: {} };
        const next = e => expect(e instanceof UnauthorizedError).toBeTruthy();

        ensureCorrectUser(req, res, next);
    });
});