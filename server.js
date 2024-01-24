// Imports
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser')
require("dotenv").config();

// Server Setup
const app = express();

let users = [];


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
    const user = users.find((user) => user.username === req.body.username);

    if(user != null) {
        res.status(400).render("signup");
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        users.push({
            username: req.body.username,
            password: hashedPassword,
        });

        res.status(201).render("signupresult", { successful: true });
    } catch (e) {
        res.status(500).render("signupresult", { successful: false });
    }
});


app.post("/usernameExists", (req, res) => {
    const user = users.find((user) => user.username === req.body.username);

    if(user != null) {
        res.json({ exists: true });
        return;
    }

    res.json({ exists: false });
})


app.get("/login", redirectIfAuthenticated, (req, res) => {
    res.render("login");
})


app.post("/login", async (req, res) => {
    const user = users.find((user) => user.username === req.body.username);

    if (user == null) {
        return res.status(400).send("Username or password is incorrect!");
    }

    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
            res.json({ accessToken: accessToken });
        } else {
            res.status(401).send("Username or password is incorrect!");
        }
    } catch (e) {
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
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    res.sendStatus(204);
});


app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
