const express = require("express");
const { engine } = require("express-handlebars");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const IdeaModel = require("./models/Idea.js");

const app = express();

// Connect to mongoose
const dbURI = `mongodb://127.0.0.1:27017/vidjot-dev`;
mongoose
  .connect(dbURI)
  .then(() => {
    console.log("MongoDB Connected ");
  })
  .catch((err) => console.log(err));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

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

app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
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

// Render Ideas list form
app.get("/ideas", (req, res) => {
  IdeaModel.find({})
    .sort({ date: "desc" })
    .then((ideas) => {
      let ideas2 = ideas.map((elem) => {
        return {
          id: elem.id,
          title: elem.title,
          details: elem.details,
          date: elem.date,
        };
      });
      res.render("ideas/list", {
        ideas: ideas2,
      });
    });
});

// Render Add Idea form
app.get("/ideas/add", (req, res) => {
  res.render("ideas/add");
});

// Render Edit Idea form
app.get("/ideas/edit/:id", (req, res) => {
  IdeaModel.findOne({ _id: req.params.id }).then((elem) => {
    let idea2 = {
      id: elem.id,
      title: elem.title,
      details: elem.details,
      date: elem.date,
    };
    res.render("ideas/edit", {
      idea: idea2,
    });
  });
});

// Post idea and redirect to Ideas
app.post("/ideas", urlencodedParser, (req, res) => {
  let errors = [];
  const title = req.body.title;
  const details = req.body.details;
  if (title.trim().length === 0) {
    errors.push({ text: "Title must have a value" });
  }
  if (details.trim().length === 0) {
    errors.push({ text: "Details must have a value" });
  }
  if (errors.length > 0) {
    res.render("ideas/add", { errors: errors, title: title, details: details });
  } else {
    const newIdea = {
      title: title,
      details: details,
    };
    new IdeaModel(newIdea).save().then(() => {
      req.flash("success_msg", "Idea has been created");
      res.redirect("/ideas");
    });
  }
});

// Update (PUT) Idea and redirect to Ideas
app.put("/ideas/:id", urlencodedParser, (req, res) => {
  IdeaModel.findOne({
    _id: req.params.id,
  }).then((elem) => {
    // new values
    elem.title = req.body.title;
    elem.details = req.body.details;

    elem.save().then(() => {
      req.flash("success_msg", "Idea has been updated");
      res.redirect("/ideas");
    });
  });
});

// Delete Idea and redirect to Ideas
app.delete("/ideas/:id", urlencodedParser, (req, res) => {
  IdeaModel.deleteOne({
    _id: req.params.id,
  }).then(() => {
    req.flash("success_msg", "Idea has been deleted");
    res.redirect("/ideas");
  });
});

// Start server
const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
