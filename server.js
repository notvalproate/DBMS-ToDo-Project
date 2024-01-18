// Imports
const express = require("express");
const bodyParser = require("body-parser");

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
})

app.post("/users", (req, res) => {
    console.log(req.body);

    const user = {
        username: req.body.username,   
        password: req.body.password
    }

    users.push(user);

    res.status(201).send();
})

// Run Server using the http socket server created.
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
