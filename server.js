// Imports
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var cookieParser = require('cookie-parser')
require("dotenv").config();


// Server Setup
const app = express();

let users = [];
let refreshTokens = [];


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cookieParser());

// View engine and views path
app.set("view engine", "ejs");
app.set("views", "views");


// Routes
app.get("/", (req, res) => {
    res.render("login");
});


app.get("/signup", (req, res) => {
    res.render("signup");
});


app.post("/signup", async (req, res) => {
    const user = users.find((user) => user.username === req.body.username);

    if(user != null) {
        res.status(400).send("User already exists!");
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


app.get("/login", (req, res) => {
    res.render("login");
})


app.post("/login", async (req, res) => {
    const user = users.find((user) => user.username === req.body.username);

    if (user == null) {
        return res.status(400).send("Username or password is incorrect!");
    }

    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
            refreshTokens.push(refreshToken);
            res.json({ accessToken: accessToken, refreshToken: refreshToken });
        } else {
            res.status(401).send("Username or password is incorrect!");
        }
    } catch (e) {
        res.status(500).send("Error logging in, Please try again!");
    }
});


app.get("/account", authenticateToken, async (req, res) => {
    res.send(`Accessing account of user: ${req.user.username}`);
});


function authenticateToken(req, res, next) {
    const cookies = req.cookies;

    let token = null;

    if(cookies.ACT) {
        token = cookies.ACT;
    }

    if(token == null) {
        return res.status(401).redirect("/login");
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.status(403).redirect("/login");
        }

        req.user = user;
        req.authenticated = true;
        next();
    });
}


app.post("/token", (req, res) => {
    const refreshToken = req.body.token;

    if(refreshToken == null) {
        return res.sendStatus(401);
    }

    if(!refreshTokens.includes(refreshToken)) {
        return res.sendStatus(403);
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.sendStatus(403);
        }

        refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

        const accessToken = jwt.sign({ username: user.username, password: user.password }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
        const newRefreshToken = jwt.sign({ username: user.username, password: user.password }, process.env.REFRESH_TOKEN_SECRET);
        refreshTokens.push(newRefreshToken);
        res.json({ accessToken: accessToken, refreshToken: newRefreshToken });
    });
});


app.delete("/logout", (req, res) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    res.sendStatus(204);
});


app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
