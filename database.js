const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise();

async function getCity(cityName) {
    const [[city]] = await pool.query(`
    SELECT *
    FROM city
    WHERE Name = ?
    `, [cityName]);
    return city;
}

async function describeTable(tableName) {
    const [result] = await pool.query(`DESCRIBE ${tableName}`);
    console.log(result);
}

async function main() {
    const city = await getCity("Paris");
    console.log(city);
    describeTable("city");
}

main();