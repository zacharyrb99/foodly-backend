const { BadRequestError } = require('../expressError');

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