const { BadRequestError } = require('../expressError');

/**
 * Helper for making selective update queries.
 *
 * The calling function can use it to make the SET clause of an SQL UPDATE
 * statement.
 *
 * @param dataToUpdate {Object} {field1: newVal, field2: newVal, ...}
 * @param jsToSql {Object} maps js-style data fields to database column names,
 *   like { firstName: "first_name", age: "age" }
 *
 * @returns {Object} {sqlSetCols, dataToUpdate}
 *
 * @example {firstName: 'Aliya', age: 32} =>
 *   { setCols: '"first_name"=$1, "age"=$2',
 *     values: ['Aliya', 32] }
 */

const sqlPartialUpdate = (data, jsToSQL) => {
    const keys = Object.keys(data);
    if (keys.length === 0) throw new BadRequestError("No data.");

    const columns = keys.map((columnName, index) => `"${jsToSQL[columnName] || columnName}"=$${index + 1}`);

    return {
        setColumns: columns.join(", "),
        values: Object.values(data)
    };
}

module.exports = { sqlPartialUpdate };