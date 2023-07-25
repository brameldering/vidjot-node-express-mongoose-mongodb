const express = require("express");
const path = require("path");
const { engine } = require("express-handlebars");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

const app = express();

// Load routes
const ideas = require("./routes/ideas");
const users = require("./routes/users");

// Passport config
require("./config/passport.js")(passport);

// Connect to local DB
// const dbURI = `mongodb://127.0.0.1:27017/vidjot-dev`;

// Connect to Mongo Atlas
require("dotenv").config();
const dbURI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@bram-test-mongodb.koftlqn.mongodb.net/ideas-log-db?retryWrites=true&w=majority`;

mongoose
  .connect(dbURI)
  .then(() => {
    console.log("MongoDB Connected ");
  })
  .catch((err) => console.log(err));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Method override middleware
app.use(methodOverride("_method"));

// Express session middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Render Welcome Page
app.get("/", (req, res) => {
  const title = "Welcome";
  res.render("home", { title: title });
});

// Render About Page
app.get("/about", (req, res) => {
  res.render("about");
});

// use Routes
app.use("/ideas", ideas);
app.use("/users", users);

// Start server
const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
