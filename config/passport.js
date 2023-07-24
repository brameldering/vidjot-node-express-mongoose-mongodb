const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
// Load user model
const UserModel = require("../models/User.js");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Find user
      UserModel.findOne({
        email: email,
      }).then((user) => {
        if (!user) {
          return done(null, false, { message: "No user found" });
        }
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          //   console.log("In passport.js match password");
          //   console.log(password);
          //   console.log(user.password);
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password incorrect" });
          }
        });
      });
    })
  );
  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    // console.log("In serializeuser");
    // console.log(user);
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    UserModel.findById(id).then((user) => {
      //   console.log("In deserializeUser");
      //   console.log(user);
      done(null, user);
    });
  });
};
