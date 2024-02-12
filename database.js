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

    CreateUserView:
    `
    CREATE OR REPLACE VIEW user_view AS
    SELECT userid, username, current_mood 
    FROM user;
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

    FindWithUsernameSafe:
    `
    SELECT * FROM user_view WHERE username = ?;
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

    CreateTaskView:
    `
    CREATE OR REPLACE VIEW task_view AS
    SELECT taskid, task, task_date, completed 
    FROM tasks;
    `,

    CreateNewTask:
    `
    INSERT INTO tasks (userid, task)     
    VALUES (?, ?);
    `,

    GetTaskById:
    `
    SELECT * FROM task_view
    WHERE taskid = ?
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

    // DIARY TABLE QUERIES

    CreateDiaryTable:
    `
    CREATE TABLE IF NOT EXISTS diarys (
        userid INT NOT NULL,
        content NVARCHAR(2000) NOT NULL,
        mood INT NOT NULL CHECK(mood >= 1 AND mood <= 5),
        diary_date DATE NOT NULL DEFAULT (CURRENT_DATE),
        FOREIGN KEY (userid) REFERENCES user(userid)
    );
    `,

    CreateNewDiaryEntry:
    `
    INSERT INTO diarys (userid, content, mood)
    VALUES (?, ?, ?);
    `,

    GetTodaysDiary:
    `
    SELECT * FROM diarys
    WHERE userid = ? AND diary_date = CURDATE();
    `,

    GetDiaryEntriesByUserIdLast7Days:
    `
    SELECT * FROM diarys
    WHERE userid = ? AND diary_date >= CURDATE() - INTERVAL 6 DAY;
    `,

    GetDiaryEntriesByUserIdLast30Days:
    `
    SELECT * FROM diarys
    WHERE userid = ? AND diary_date >= CURDATE() - INTERVAL 30 DAY;
    `,

    GetAverageMoodLast7Days:
    `
    SELECT AVG(mood) as average_mood
    FROM diarys
    WHERE userid = ? AND diary_date BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE()
    `,

    GetAverageMoodLast30Days:
    `
    SELECT AVG(mood) as average_mood
    FROM diarys
    WHERE userid = ? AND diary_date BETWEEN CURDATE() - INTERVAL 29 DAY AND CURDATE()
    `,

    GetDiariesByUserIdBetweenDates:
    `
    SELECT * FROM diarys
    WHERE userid = ? AND diary_date BETWEEN ? AND ?
    `,
};


class DatabaseManager {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            timezone: 'utc',
        }).promise();

        this.createTables();
    }

    async createTables() {
        await this.pool.query(queries.CreateUserTable);
        await this.pool.query(queries.CreateUserView);
        await this.pool.query(queries.CreateTaskTable);
        await this.pool.query(queries.CreateTaskView);
        await this.pool.query(queries.CreateTaskTrigger);
        await this.pool.query(queries.CreateDiaryTable);
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

    async getUserByUsernameSafe(username) {
        try {
            const [rows] = await this.pool.query(queries.FindWithUsernameSafe, [username]);

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

            const [result] = await this.pool.query(queries.CreateNewTask, [userResult.userid, task]);

            const [[insertedTask]] = await this.pool.query(queries.GetTaskById, [result.insertId]);

            return insertedTask;
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

    // DIARY QUERIES

    async insertDiaryEntry(userid, content, mood) {
        try {
            await this.pool.query(queries.CreateNewDiaryEntry, [userid, content, mood]);
        } catch (error) {
            console.error('Error inserting diary entry:', error.message);
        }
    }

    async getIfDiaryWrittenToday(userid) {
        try {
            const [result] = await this.pool.query(queries.GetTodaysDiary, [userid]);

            if(result.length == 1) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error checking diary entry:', error.message);
        }
    }

    async getDiariesByUserIdLast30Days(userid) {
        try {
            const [rows] = await this.pool.query(queries.GetDiaryEntriesByUserIdLast30Days, [userid]);
            return rows;
        } catch (error) {
            console.error('Error retrieving diaries by userid for the last 30 days:', error.message);
            return [];
        }
    }

    async getDiariesByUserIdLast7Days(userid) {
        try {
            const [rows] = await this.pool.query(queries.GetDiaryEntriesByUserIdLast7Days, [userid]);
            return rows;
        } catch (error) {
            console.error('Error retrieving diaries by userid for the last 30 days:', error.message);
            return [];
        }
    }

    async getAverageMoodLast7Days(userid) {
        try {
            const [rows] = await this.pool.query(queries.GetAverageMoodLast7Days, [userid]);
            const averageMood = rows[0] ? rows[0].average_mood : 0;
            return averageMood;
        } catch (error) {
            console.error('Error retrieving average mood for the last 7 days:', error.message);
            return 0;
        }
    }

    async getAverageMoodLast30Days(userid) {
        try {
            const [rows] = await this.pool.query(queries.GetAverageMoodLast30Days, [userid]);
            const averageMood = rows[0] ? rows[0].average_mood : 0;
            return averageMood;
        } catch (error) {
            console.error('Error retrieving average mood for the last 30 days:', error.message);
            return 0;
        }
    }

    async getDiariesByUserIdBetweenDates(userid, startDate, endDate) {
        try {
            const [rows] = await this.pool.query(queries.GetDiariesByUserIdBetweenDates, [userid, startDate, endDate]);
            return rows;
        } catch (error) {
            console.error('Error retrieving diaries by userid between dates:', error.message);
            return [];
        }
    }
};

module.exports = DatabaseManager;