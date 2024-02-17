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

    CreateUserIndex:
    `
    CREATE INDEX username_index ON user (username);  
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

    GetTaskByDate:
    `
    SELECT * FROM tasks
    WHERE userid = ? AND task_date = ?;
    `,

    UpdateTaskCompletion:
    `
    UPDATE tasks
    SET completed = ?
    WHERE taskid = ?;
    `,

    DeleteTaskByTaskId:
    `
    DELETE FROM tasks
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

    GetTotalTasksCompletedInLast7Days:
    `
    SELECT COUNT(taskid) as tasks_sum
        FROM tasks
        WHERE completed = b'1' AND userid = ? AND task_date BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE();
    `,

    GetTotalTasksSumForLast7Days:
    `
    SELECT task_date, COUNT(taskid) as tasks_sum
        FROM tasks
        WHERE userid = ? AND task_date BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE()
        GROUP BY task_date ORDER BY task_date ASC;
    `,

    GetCompletedTasksSumForLast7Days:
    `
    SELECT task_date, COUNT(taskid) as tasks_sum
        FROM tasks
        WHERE completed = b'1' AND userid = ? AND task_date BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE()
        GROUP BY task_date ORDER BY task_date ASC;
    `,

    GetTotalTasksInLast30Days:
    `
    SELECT COUNT(taskid) as tasks_sum
        FROM tasks
        WHERE userid = ? AND task_date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE();
    `,

    GetTotalTasksCompletedInLast30Days:
    `
    SELECT COUNT(taskid) as tasks_sum
        FROM tasks
        WHERE completed = b'1' AND userid = ? AND task_date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE();
    `,

    GetTotalTasksSumForLast30Days:
    `
    SELECT task_date, COUNT(taskid) as tasks_sum
        FROM tasks
        WHERE userid = ? AND task_date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()
        GROUP BY task_date ORDER BY task_date ASC;
    `,

    GetCompletedTasksSumForLast30Days:
    `
    SELECT task_date, COUNT(taskid) as tasks_sum
        FROM tasks
        WHERE completed = b'1' AND userid = ? AND task_date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()
        GROUP BY task_date ORDER BY task_date ASC;
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
        diary_date DATE UNIQUE NOT NULL DEFAULT (CURRENT_DATE),
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

    GetDiaryByDate:
    `
    SELECT * FROM diarys
    WHERE userid = ? AND diary_date = ?;
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
    WHERE userid = ? AND diary_date BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE();
    `,

    GetAverageMoodLast30Days:
    `
    SELECT AVG(mood) as average_mood
    FROM diarys
    WHERE userid = ? AND diary_date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE();
    `,

    GetMoodPastWeek:
    `
    SELECT diary_date, mood
    FROM diarys
    WHERE userid = ? AND diary_date BETWEEN CURDATE() - INTERVAL 7 DAY AND CURDATE()
    ORDER BY diary_date ASC;
    `,

    GetMoodPastMonth:
    `
    SELECT diary_date, mood
    FROM diarys
    WHERE userid = ? AND diary_date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()
    ORDER BY diary_date ASC;
    `,

    GetDiariesByUserIdBetweenDates:
    `
    SELECT * FROM diarys
    WHERE userid = ? AND diary_date BETWEEN ? AND ?;
    `,

    // MESSAGE QUERIES

    CreateMessageTable:
    `
    CREATE TABLE IF NOT EXISTS messages (
        userid INT NOT NULL,
        content NVARCHAR(2000) NOT NULL,
        reminder_date DATE NOT NULL,
        FOREIGN KEY (userid) REFERENCES user(userid)
    );
    `,

    GetMessagesByDate:
    `
    SELECT * FROM messages
    WHERE userid = ? AND reminder_date = ?;
    `,

    GetTodaysMessage:
    `
    SELECT * FROM messages
    WHERE userid = ? AND reminder_date = CURDATE();
    `,

    CreateNewMessageEntry:
    `
    INSERT INTO messages (userid, content, reminder_date)
    VALUES (?, ?, ?);
    `,

    CreateMessageCheckTrigger:
    `
    CREATE TRIGGER IF NOT EXISTS date_check_message
    BEFORE INSERT ON messages
    FOR EACH ROW
    BEGIN
        IF NEW.reminder_date <= CURDATE() THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid date!';
        END IF;
    END;
    `
};


class DatabaseManager {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            timezone: '+00:00',
        }).promise();

        this.createTables();
    }

    async createTables() {
        try {
            await this.pool.query(queries.CreateUserTable);
            await this.pool.query(queries.CreateUserView);
            await this.pool.query(queries.CreateUserIndex);

            await this.pool.query(queries.CreateTaskTable);
            await this.pool.query(queries.CreateTaskView);
            await this.pool.query(queries.CreateTaskTrigger);

            await this.pool.query(queries.CreateDiaryTable);
            
            await this.pool.query(queries.CreateMessageTable);
            await this.pool.query(queries.CreateMessageCheckTrigger);
        } catch (error) {
            console.error('Error creating: ', error.message);
        }
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

    async deleteTask(taskid) {
        try {
            await this.pool.query(queries.DeleteTaskByTaskId, [taskid]);
        } catch (error) {
            console.error('Error deleting tasks for the taskid:', error.message);
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

    async getTasksByDate(userid, date) {
        try {
            const [rows] = await this.pool.query(queries.GetTaskByDate, [userid,  date]);
            return rows;
        } catch (error) {
            console.error('Error retrieving tasks for the current date:', error.message);
            return [];
        }
    }

    async getTotalTasksInLast7Days(userid) {
        try {
            const [[rows]] = await this.pool.query(queries.GetTotalTasksInLast7Days, [userid]);
            return rows.tasks_sum;
        } catch (error) {
            console.error('Error retrieving total tasks sum for the last 7 days:', error.message);
            return 0;
        }
    }

    async getTotalTasksCompletedInLast7Days(userid) {
        try {
            const [[rows]] = await this.pool.query(queries.GetTotalTasksCompletedInLast7Days, [userid]);
            return rows.tasks_sum;
        } catch (error) {
            console.error('Error retrieving total tasks sum for the last 7 days:', error.message);
            return 0;
        }
    }

    async getTotalTasksSumForLast7Days(userid) {
        try {
            const [rows] = await this.pool.query(queries.GetTotalTasksSumForLast7Days, [userid]);
            return rows;
        } catch (error) {
            console.error('Error retrieving total tasks sum for the last 7 days:', error.message);
            return [];
        }
    }

    async getCompletedTasksSumForLast7Days(userid) {
        try {
            const [rows] = await this.pool.query(queries.GetCompletedTasksSumForLast7Days, [userid]);
            return rows;
        } catch (error) {
            console.error('Error retrieving total tasks sum for the last 7 days:', error.message);
            return [];
        }
    }

    async getTotalTasksInLast30Days(userid) {
        try {
            const [[rows]] = await this.pool.query(queries.GetTotalTasksInLast30Days, [userid]);
            return rows.tasks_sum;
        } catch (error) {
            console.error('Error retrieving total tasks sum for the last 7 days:', error.message);
            return 0;
        }
    }

    async getTotalTasksCompletedInLast30Days(userid) {
        try {
            const [[rows]] = await this.pool.query(queries.GetTotalTasksCompletedInLast30Days, [userid]);
            return rows.tasks_sum;
        } catch (error) {
            console.error('Error retrieving total tasks sum for the last 7 days:', error.message);
            return 0;
        }
    }

    async getTotalTasksSumForLast30Days(userid) {
        try {
            const [rows] = await this.pool.query(queries.GetTotalTasksSumForLast30Days, [userid]);
            return rows;
        } catch (error) {
            console.error('Error retrieving total tasks sum for the last 7 days:', error.message);
            return [];
        }
    }

    async getCompletedTasksSumForLast30Days(userid) {
        try {
            const [rows] = await this.pool.query(queries.GetCompletedTasksSumForLast30Days, [userid]);
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

    async getDiaryByDate(userid, date) {
        try {
            const [[rows]] = await this.pool.query(queries.GetDiaryByDate, [userid,  date]);
            return rows;
        } catch (error) {
            console.error('Error retrieving tasks for the current date:', error.message);
            return [];
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

    async getMoodPastWeek(userid) {
        try {
            const [rows] = await this.pool.query(queries.GetMoodPastWeek, [userid]);
            return rows;
        } catch (error) {
            console.error('Error retrieving average mood for the last 30 days:', error.message);
            return [];
        }
    }

    async getMoodPastMonth(userid) {
        try {
            const [rows] = await this.pool.query(queries.GetMoodPastMonth, [userid]);
            return rows;
        } catch (error) {
            console.error('Error retrieving average mood for the last 30 days:', error.message);
            return [];
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

    // MESSAGE QUERIES

    async insertMessageEntry(userid, message, date) {
        try {
            await this.pool.query(queries.CreateNewMessageEntry, [userid, message, date]);
        } catch (error) {
            console.error('Error creating a new message', error.message);
            return [];
        }
    }

    async getMessagesByDate(userid, date) {
        try {
            const [rows] = await this.pool.query(queries.GetMessagesByDate, [userid,  date]);
            return rows;
        } catch (error) {
            console.error('Error retrieving tasks for the current date:', error.message);
            return [];
        }
    }
};

module.exports = DatabaseManager;