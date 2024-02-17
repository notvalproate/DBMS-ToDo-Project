// Imports
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser')
require("dotenv").config();

// Database
const DatabaseManager = require('./database');
const { authPlugins } = require("mysql2");

let DatabaseHandler = new DatabaseManager();

// Server Setup
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cookieParser());

// View engine and views path
app.set("view engine", "ejs");
app.set("views", "views");


// Routes
app.get("/", redirectIfAuthenticated, (req, res) => {
    res.render("login");
});


app.get("/signup", redirectIfAuthenticated, (req, res) => {
    res.render("signup");
});


app.post("/signup", async (req, res) => {
    const userExists = await DatabaseHandler.doesUsernameExist(req.body.username);

    if(userExists) {
        res.status(400).render("signup");
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        await DatabaseHandler.createUser(req.body.username, hashedPassword);

        res.status(201).render("signupresult", { successful: true });
    } catch (e) {
        res.status(500).render("signupresult", { successful: false });
    }
});


app.post("/usernameExists", async (req, res) => {
    res.json({ exists: await DatabaseHandler.doesUsernameExist(req.body.username) });
})


app.get("/login", redirectIfAuthenticated, (req, res) => {
    res.render("login");
})


app.post("/login", async (req, res) => {
    const userExists = await DatabaseHandler.doesUsernameExist(req.body.username);

    if (!userExists) {
        return res.status(400).send("Username or password is incorrect!");
    }

    const user = await DatabaseHandler.getUserByUsername(req.body.username);

    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const jwtUser = await DatabaseHandler.getUserByUsernameSafe(req.body.username);
            const accessToken = jwt.sign(jwtUser, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.json({ accessToken: accessToken });
        } else {
            res.status(401).send("Username or password is incorrect!");
        }
    } catch (e) {
        console.log(e);
        res.status(500).send("Error logging in, Please try again!");
    }
});


app.get("/home", authenticateToken, async (req, res) => {
    res.render("home", { username: req.user.username });
});


function authenticateToken(req, res, next) {
    const cookies = req.cookies;

    let token = null;

    if(cookies.ACT) {
        token = cookies.ACT;
    } else {
        return res.status(401).redirect("/login");
    }


    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.redirect("/login");
        }

        req.user = user;
        req.authenticated = true;
        next();
    });
}


function redirectIfAuthenticated(req, res, next) {
    let authenticated = false;

    const cookies = req.cookies;

    let token = null;

    if(cookies.ACT) {
        token = cookies.ACT;
    } else {
        next();
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(!err) {
            authenticated = true;
        }
    });

    if(authenticated) {
        return res.redirect("/home");
    }
    
    next();
}

app.delete("/logout", (req, res) => {
    res.sendStatus(204);
});

// GET REQUESTS FOR PAGES

// REQUESTS FOR THE TODOS

app.get("/todo", authenticateToken, async (req, res) => {
    res.render("todo");
});

app.post("/getTodaysTodos", authenticateToken, async (req, res) => {
    const todaysTodos = await DatabaseHandler.getTasksForCurrentDate(req.user.username);

    res.json(todaysTodos);
});

app.post("/addTodo", authenticateToken, async (req, res) => {
    const taskCreated = await DatabaseHandler.createTask(req.user.username, req.body.taskText);
    res.status(201).json(taskCreated);
});

app.post("/setTodo", authenticateToken, async (req, res) => {
    await DatabaseHandler.updateTaskCompletion(req.body.taskid, req.body.isCompleted);
    res.status(201).send("Task set successfully");
});

app.post("/removeTodo", authenticateToken, async (req, res) => {
    await DatabaseHandler.deleteTask(req.body.taskid);
    res.status(200).send("Task deleted successfully");
});

// REQUESTS FOR DIARY

app.get("/diary", authenticateToken, async (req, res) => {
    const diaryWritten = await DatabaseHandler.getIfDiaryWrittenToday(req.user.userid);

    res.render("diary", { diaryWritten: diaryWritten });
});

app.post("/addDiaryEntry", authenticateToken, async (req, res) => {
    await DatabaseHandler.insertDiaryEntry(req.user.userid, req.body.content, parseInt(req.body.mood));

    res.status(201).send("Created diary entry successfully");
})

app.post("/getPast7Diaries", authenticateToken, async (req, res) => {
    const diaries = await DatabaseHandler.getDiariesByUserIdLast7Days(req.user.userid);

    res.json(diaries);
})

// REQUESTS FOR MESSAGE

app.get("/message", authenticateToken, async (req, res) => {
    res.render("send");
});

app.get("/createMessage", authenticateToken, async (req, res) => {
    res.redirect("/message");
})

app.post("/createMessage", authenticateToken, async (req, res) => {
    await DatabaseHandler.insertMessageEntry(req.user.userid, req.body.message, req.body.date);

    res.render("msgsubmit");
})

// REQUESTS FOR LOGS

app.get("/logs", authenticateToken, async (req, res) => {
    res.render("mylogs");
})

app.post("/getLogs", authenticateToken, async (req, res) => {
    const todos = await DatabaseHandler.getTasksByDate(req.user.userid, req.body.date);
    const diary = await DatabaseHandler.getDiaryByDate(req.user.userid, req.body.date);
    const messages = await DatabaseHandler.getMessagesByDate(req.user.userid, req.body.date);

    res.json({ 
        todos: todos, 
        diary: diary, 
        messages: messages,
    });
})

app.post("/getData", authenticateToken, async (req, res) => {
    // Get data for the values

    const averageMoodWeek = await DatabaseHandler.getAverageMoodLast7Days(req.user.userid);

    const totalLastWeek = await DatabaseHandler.getTotalTasksInLast7Days(req.user.userid);
    const totalCompletedLastWeek = await DatabaseHandler.getTotalTasksCompletedInLast7Days(req.user.userid);
    const productivityWeek = (totalCompletedLastWeek * 100) / totalLastWeek;

    const averageMoodMonth = await DatabaseHandler.getAverageMoodLast30Days(req.user.userid);

    const totalLastMonth = await DatabaseHandler.getTotalTasksInLast30Days(req.user.userid);
    const totalCompletedLastMonth = await DatabaseHandler.getTotalTasksCompletedInLast30Days(req.user.userid);
    const productivityMonth = (totalCompletedLastMonth * 100) / totalLastMonth;

    // Get data for the graphs

    const graphTotalTasks7 = await DatabaseHandler.getTotalTasksSumForLast7Days(req.user.userid);
    const graphCompletedTasks7 = await DatabaseHandler.getCompletedTasksSumForLast7Days(req.user.userid);

    const graphTotalTasks30 = await DatabaseHandler.getTotalTasksSumForLast30Days(req.user.userid);
    const graphCompletedTasks30 = await DatabaseHandler.getCompletedTasksSumForLast30Days(req.user.userid);

    const obj = { 
        productivityWeek: productivityWeek, 
        productivityMonth: productivityMonth,
        averageMoodWeek: averageMoodWeek,
        averageMoodMonth: averageMoodMonth,

        graphTotalTasks7: graphTotalTasks7,
        graphCompletedTasks7: graphCompletedTasks7,  
        graphTotalTasks30: graphTotalTasks30,
        graphCompletedTasks30: graphCompletedTasks30,
    }

    console.log(obj);

    res.json(obj);
})

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
