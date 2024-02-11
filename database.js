const mysql = require("mysql2");
require("dotenv").config();

const queries = {
    // USER TABLE QUERIES

    CreateUserTable:
    `
    CREATE TABLE IF NOT EXISTS user (
        userid INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(16) UNIQUE NOT NULL,
        password VARCHAR(128) NOT NULL,
        total_tasks INT NOT NULL DEFAULT 0,
        current_mood INT NOT NULL DEFAULT 3 CHECK(current_mood >= 0 and current_mood <= 5)
    );
    `,
    
    CreateNewUser: 
    `
    INSERT INTO user (username, password) 
    VALUES (?, ?);
    `,

    FindWithUsername:
    `
    SELECT * FROM user WHERE username = ?;
    `,

    // TASK TABLE QUERIES
    
    CreateTaskTable:
    `
    CREATE TABLE IF NOT EXISTS tasks (
        taskid INT PRIMARY KEY AUTO_INCREMENT,
        userid INT NOT NULL,
        task VARCHAR(100) NOT NULL,
        task_date DATE NOT NULL DEFAULT (CURRENT_DATE),
        completed BIT(1) NOT NULL DEFAULT b'0',
        FOREIGN KEY (userid) REFERENCES user(userid)
    );
    `,

    CreateNewTask:
    `
    INSERT INTO tasks (userid, task)     
    VALUES (?, ?);
    `,

    UpdateTaskCompletion:
    `
    UPDATE tasks
    SET completed = ?
    WHERE taskid = ?;
    `,

    GetTasksForCurrentDate:
    `
    SELECT * FROM tasks
    WHERE task_date = CURRENT_DATE and userid = ?;
    `,

    GetTotalTasksInLast7Days:
    `
    SELECT COUNT(taskid) as tasks_sum
        FROM tasks
        WHERE userid = ? AND task_date BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE();
    `,

    GetTotalTasksSumForLast7Days:
    `
    SELECT task_date, COUNT(taskid) as tasks_sum
        FROM tasks
        WHERE userid = ? AND task_date BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE()
        GROUP BY task_date;
    `,

    GetTotalTasksCompletedInLast7Days:
    `
    SELECT COUNT(taskid) as tasks_sum
        FROM tasks
        WHERE completed = b'1' AND userid = ? AND task_date BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE();
    `,

    GetCompletedTasksSumForLast7Days:
    `
    SELECT task_date, COUNT(taskid) as tasks_sum
        FROM tasks
        WHERE completed = b'1' AND userid = ? AND task_date BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE()
        GROUP BY task_date;
    `,

    CreateTaskTrigger:
    `
    CREATE TRIGGER IF NOT EXISTS update_total_tasks
    AFTER INSERT ON tasks
    FOR EACH ROW
    BEGIN
        UPDATE user
        SET total_tasks = (SELECT COUNT(*) FROM tasks WHERE userid = NEW.userid)
        WHERE userid = NEW.userid;
    END;
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
        await this.pool.query(queries.CreateTaskTable);
        await this.pool.query(queries.CreateTaskTrigger);
    }

    // USER QUERIES

    async createUser(username, password) {
        try {
            await this.pool.query(queries.CreateNewUser, [username, password]);
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

    // TASK QUERIES

    async createTask(username, task) {
        try {
            const [[userResult]] = await this.pool.query(queries.FindWithUsername, [username]);

            await this.pool.query(queries.CreateNewTask, [userResult.userid, task]);
        } catch (error) {
            console.error('Error inserting task:', error.message);
        }
    }

    async updateTaskCompletion(taskid, isCompleted) {
        try {
            await this.pool.query(queries.UpdateTaskCompletion, [isCompleted, taskid]);
        } catch (error) {
            console.error('Error updating task completion status:', error.message);
        }
    }

    async getTasksForCurrentDate(username) {
        try {
            const [[userResult]] = await this.pool.query(queries.FindWithUsername, [username]);

            const [rows] = await this.pool.query(queries.GetTasksForCurrentDate, [userResult.userid]);
            return rows;
        } catch (error) {
            console.error('Error retrieving tasks for the current date:', error.message);
            return [];
        }
    }

    async getTotalTasksInLast7Days(username) {
        try {
            const [[userResult]] = await this.pool.query(queries.FindWithUsername, [username]);

            const [[rows]] = await this.pool.query(queries.getTotalTasksInLast7Days, [userResult.userid]);
            return rows.tasks_sum;
        } catch (error) {
            console.error('Error retrieving total tasks sum for the last 7 days:', error.message);
            return 0;
        }
    }

    async getTotalTasksSumForLast7Days(username) {
        try {
            const [[userResult]] = await this.pool.query(queries.FindWithUsername, [username]);

            const [rows] = await this.pool.query(queries.GetTotalTasksSumForLast7Days, [userResult.userid]);
            return rows;
        } catch (error) {
            console.error('Error retrieving total tasks sum for the last 7 days:', error.message);
            return [];
        }
    }

    async getTotalTasksCompletedInLast7Days(username) {
        try {
            const [[userResult]] = await this.pool.query(queries.FindWithUsername, [username]);

            const [[rows]] = await this.pool.query(queries.getTotalTasksCompletedInLast7Days, [userResult.userid]);
            return rows.tasks_sum;
        } catch (error) {
            console.error('Error retrieving total tasks sum for the last 7 days:', error.message);
            return 0;
        }
    }

    async getCompletedTasksSumForLast7Days(username) {
        try {
            const [[userResult]] = await this.pool.query(queries.FindWithUsername, [username]);

            const [rows] = await this.pool.query(queries.getCompletedTasksSumForLast7Days, [userResult.userid]);
            return rows;
        } catch (error) {
            console.error('Error retrieving total tasks sum for the last 7 days:', error.message);
            return [];
        }
    }
};

module.exports = DatabaseManager;