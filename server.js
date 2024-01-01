// Imports
const express = require("express");
const bodyParser = require("body-parser");

// Server Setup
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("/public"));

// View engine and views path
app.set("view engine", "ejs");
app.set("views", "views");

// GET routes
app.get("/", (req, res) => {
    res.render("index");
});

// Run Server using the http socket server created.
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
