// Imports
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Server Setup
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// View engine and views path
app.set("view engine", "ejs");
app.set("views", "views");

// GET routes
app.get("/", (req, res) => {
    res.render("index");
});

let users = [];
let refreshTokens = [];

app.get("/signup", (req, res) => {
    res.json(users);
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

        res.status(201).send();
    } catch (e) {
        res.status(500).send();
    }
});

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
        res.sendStatus(204);

        const accessToken = jwt.sign({ username: user.username, password: user.password }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
        const newRefreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
        refreshTokens.push(newRefreshToken);
        res.json({ accessToken: accessToken, refreshToken: newRefreshToken }).send("Success");
    });
});

app.post("/login", async (req, res) => {
    const user = users.find((user) => user.username === req.body.username);

    if (user === null) {
        return res.status(400).send("Cannot find user!");
    }

    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
            refreshTokens.push(refreshToken);
            res.json({ accessToken: accessToken, refreshToken: refreshToken }).send("Success");
        } else {
            res.send("Not allowed");
        }
    } catch (e) {
        res.status(500).send();
    }
});


app.get("/account", authenticateToken, async (req, res) => {
    res.send(`Accessing account of user: ${req.user.username}`);
});


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    });
}


app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
