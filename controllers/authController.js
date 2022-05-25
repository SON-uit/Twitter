const bcrypt = require("bcrypt");
const User = require("../models/userModel");
module.exports.isLogin = (req, res, next) => {
  if (req.user && req.isAuthenticated()) {
    // req.user was created by passport.session() in index.js
    req.session.user = req.user;
    next();
  }
  if (req.session && req.session.user) {
    next();
  } else {
    return res.redirect("/user/login");
  }
};

module.exports.register = async (req, res) => {
  const { firstName, lastName, userName, email, password } = req.body;
  const payload = { ...req.body };
  // All fields are full
  if (firstName && lastName && userName && email && password) {
    try {
      const user = await User.findOne({
        $or: [{ userName: userName }, { email: email }],
      });
      if (user) {
        payload.errorMessage = "User or email already registered";
      }
      //user not found,
      const newUser = await User.create(req.body);
      req.session.user = newUser;
      return res.render("register", payload);
    } catch (err) {
      console.log(err);
      payload.errorMessage = err.message;
      return res.render("register", payload);
    }
  } else {
    payload.errorMessage = "Make sure all fields is full";
    return res.render("register", payload);
  }
};
module.exports.login = async (req, res) => {
  const { userName, password } = req.body;
  const payload = { ...req.body };
  if (userName && password) {
    try {
      const loggedUser = await User.findOne({
        $or: [{ userName: userName }, { email: userName }],
      });

      if (loggedUser) {
        const isCorrectPw = await loggedUser.validatePassword(password);

        if (isCorrectPw) {
          req.session.user = loggedUser;
          return res.redirect("/");
        }
      }
      payload.errorMessage = "Login credentials incorrect";
      return res.render("login", payload);
    } catch (err) {
      console.log(err);
      payload.errorMessage = err.message;
      return res.render("login", payload);
    }
  }
  return res.render("login", payload);
};
module.exports.logout = (req, res) => {
  if (req.user && req.isAuthenticated()) {
    req.logout(req.user,err => {
      //remove req.user and clears any logged session
      if (err) {
        return next(err);
      }
      return res.status(200).send({message: 'Logout Successfully'})
    });
  }
  if (req.session) {
    req.session.destroy();
    return res.status(200).send({message: 'Logout Successfully'})
  }
};
