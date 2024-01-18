// Imports
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

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

const users = [];

app.get("/users", (req, res) => {
    res.json(users);
});

app.post("/users", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        console.log(salt, hashedPassword);

        users.push({ username: req.body.username, password: hashedPassword });
        
    } catch(e) {

    }
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
