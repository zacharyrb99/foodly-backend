const { sqlPartialUpdate } = require('./sql');

describe("sqlPartialUpdate", () => {
    test("works with 1 item", () => {
        const res = sqlPartialUpdate(
            {f1: "v1"},
            {f1: "f1", fF2: "f2"}
        );

        expect(res).toEqual({
            setColumns: "\"f1\"=$1",
            values: ["v1"]
        });
    });
    
    test("works with > 1 item", () => {
        const res = sqlPartialUpdate(
            {f1: "v1", jsF2: "v2"},
            {jsF2: "f2"}
        );

        expect(res).toEqual({
            setColumns: "\"f1\"=$1, \"f2\"=$2",
            values: ["v1", "v2"]
        });
    });
});