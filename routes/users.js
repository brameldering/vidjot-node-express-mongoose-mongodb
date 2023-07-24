const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const UserModel = require("../models/User.js");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Email and Password check regular expressions
const emailRegex = new RegExp(/^[a-zA-Z0-9_!#$%&amp;'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/);
const strongPasswordRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
);

// User login route
router.get("/login", (req, res) => {
  res.render("users/login");
});

// User register route
router.get("/register", (req, res) => {
  res.render("users/register");
});

// Save user account and redirect to ideas
router.post("/register", urlencodedParser, (req, res) => {
  let errors = [];
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  // Check mandatory fields and if email and password are valid
  if (name.trim().length === 0) {
    errors.push({ text: "Name must have a value" });
  }
  if (email.trim().length === 0) {
    errors.push({ text: "Email must have a value" });
  }
  if (password.trim().length === 0) {
    errors.push({ text: "Password must have a value" });
  }
  if (password !== passwordConfirm) {
    errors.push({ text: "Passwords do not match" });
  }
  if (!emailRegex.test(email)) {
    console.log("Email not valid");
    errors.push({
      text: "Not a valid email address",
    });
  }
  // if (!strongPasswordRegex.test(password)) {
  // errors.push({
  //   text: "Password must have a minimum of 8 characters, contain at least one uppercase, one lowercase, one numeric and one special character",
  // });
  // }
  if (password.length < 4) {
    errors.push({ text: "Password must have a minimum of 4 characters" });
  }
  if (errors.length > 0) {
    res.render("users/register", {
      errors: errors,
      name: name,
      email: email,
      password: password,
      passwordConfirm: passwordConfirm,
    });
  } else {
    // Field validation successfull
    const newUser = {
      name: name,
      email: email,
      password: password,
    };
    // Hash password and set to newUser object using the bcrypt synchronous methods
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    newUser.password = hash;
    // Check if email already exists and if so then generate error, if not then save user
    UserModel.exists({ email: email }).then((id) => {
      if (id) {
        // email already exists
        req.flash("error_msg", `User email address already exists`);
        res.redirect("/users/register");
      } else {
        // email does not yet exist, save user to database
        new UserModel(newUser)
          .save()
          .then(() => {
            req.flash("success_msg", "User has been created");
          })
          .catch((err) => {
            console.log(err);
            errors.push({ text: `Error saving user to database` });
          })
          .finally(() => {
            res.redirect("/users/login");
          });
      }
    });
  }
});

// Login process
router.post("/login", urlencodedParser, (req, res, next) => {
  let errors = [];
  const email = req.body.email;
  const password = req.body.password;
  if (email.trim().length === 0) {
    errors.push({ text: "Email must have a value" });
  }
  if (password.trim().length === 0) {
    errors.push({ text: "Password must have a value" });
  }
  if (errors.length > 0) {
    res.render("users/login", {
      errors: errors,
      email: email,
      password: password,
    });
  } else {
    // Authenticate using passport local strategy
    console.log("before authenticate, email: " + email);
    passport.authenticate("local", {
      successRedirect: "/ideas",
      failureRedirect: "/users/login",
      failureFlash: true,
    })(req, res, next);
  }
});

// User loggout route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You have been logged out");
    res.redirect("/users/login");
  });
});

module.exports = router;
