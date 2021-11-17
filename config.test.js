describe("config can come from env", () => {
    test("works", () => {
        process.env.SECRET_KEY = "test";
        process.env.PORT = "8888";
        process.env.DATABASE_URL = "other";
        process.env.NODE_ENV = "other";

        const config = require("./config");
        expect(config.SECRET_KEY).toEqual("test");
        expect(config.PORT).toEqual(8888);
        expect(config.getDatabaseURI()).toEqual("other");
        expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

        delete process.env.SECRET_KEY;
        delete process.env.PORT;
        delete process.env.DATABASE_URL;
        delete process.env.NODE_ENV;

        expect(config.getDatabaseURI()).toEqual("capstone2");
        process.env.NODE_ENV = "test";

        expect(config.getDatabaseURI()).toEqual("capstone2_test");
    });
});