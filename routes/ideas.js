const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const IdeaModel = require("../models/Idea.js");

// Import authentication check
const { ensureAuthenticated } = require("../helpers/auth.js");

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Render Ideas list form
router.get("/", ensureAuthenticated, (req, res) => {
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
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("ideas/add");
});

// Render Edit Idea form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
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
router.post("/", [urlencodedParser, ensureAuthenticated], (req, res) => {
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
    new IdeaModel(newIdea)
      .save()
      .then(() => {
        req.flash("success_msg", "Idea has been created");
      })
      .catch((err) => {
        console.log(err);
        errors.push({ text: `Error saving idea to database` });
      })
      .finally(() => {
        res.redirect("/ideas");
      });
  }
});

// Update (PUT) Idea and redirect to Ideas
router.put("/:id", [urlencodedParser, ensureAuthenticated], (req, res) => {
  IdeaModel.findOne({
    _id: req.params.id,
  }).then((elem) => {
    // new values
    elem.title = req.body.title;
    elem.details = req.body.details;
    elem
      .save()
      .then(() => {
        req.flash("success_msg", "Idea has been updated");
      })
      .catch((err) => {
        console.log(err);
        errors.push({ text: `Error updating idea in database` });
      })
      .finally(() => {
        res.redirect("/ideas");
      });
  });
});

// Delete Idea and redirect to Ideas
router.delete("/:id", [urlencodedParser, ensureAuthenticated], (req, res) => {
  IdeaModel.deleteOne({
    _id: req.params.id,
  })
    .then(() => {
      req.flash("success_msg", "Idea has been deleted");
    })
    .catch((err) => {
      console.log(err);
      errors.push({ text: `Error deleting idea from database` });
    })
    .finally(() => {
      res.redirect("/ideas");
    });
});

module.exports = router;
