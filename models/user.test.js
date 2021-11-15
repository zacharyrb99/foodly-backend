const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");
const db = require("../db");
const User = require("../models/user");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testUserIds, testrecipeIds, testcocktailIds } = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("authenticate", () => {
    test("works", () => {
        expect(2).toBe(2);
    });
});