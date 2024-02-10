const mysql = require("mysql2");
require("dotenv").config();

const queries = {
    CreateUserTable :
    `
    CREATE TABLE IF NOT EXISTS user (
        userid INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(16) UNIQUE NOT NULL,
        password VARCHAR(128) NOT NULL
    );
    `,
    
    CreateNewUser : 
    `
    INSERT INTO user (username, password) 
    VALUES (?, ?)
    `,

    FindWithUsername :
    `
    SELECT * FROM user WHERE username = ?
    `,
};


class DatabaseManager {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        }).promise();

        this.createTables();
    }

    async createTables() {
        await this.pool.query(queries.CreateUserTable);
    }

    async createUser(username, password) {
        try {
            const [result] = await this.pool.query(queries.CreateNewUser, [username, password]);
        } catch (error) {
            console.error('Error inserting user:', error.message);
        }
    }

    async doesUsernameExist(username) {
        try {
            const [rows] = await this.pool.query(queries.FindWithUsername, [username]);

            return rows.length > 0;
        } catch (error) {
            console.error('Error checking username existence:', error.message);
            return false;
        }
    }

    async getUserByUsername(username) {
        try {
            const [rows] = await this.pool.query(queries.FindWithUsername, [username]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error retrieving user by username:', error.message);
            return null; 
        }
    }
};

module.exports = DatabaseManager;