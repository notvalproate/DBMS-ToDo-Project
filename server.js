// Imports
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser')
require("dotenv").config();

// Database
const DatabaseManager = require('./database');

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
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
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

app.get("/diary", authenticateToken, async (req, res) => {
    res.render("diary");
})

app.get("/todo", authenticateToken, async (req, res) => {
    res.render("todo");
})

app.get("/message", authenticateToken, async (req, res) => {
    res.render("send");
})

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
