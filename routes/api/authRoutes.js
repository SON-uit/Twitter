const express = require("express");
const router = express.Router();
const passport = require("passport");
//google
router.get("/google", passport.authenticate("google", { scope: ["profile","email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/user/login",
    successRedirect: "/",
    session: true,
  }),
);
// face book
router.get("/facebook", passport.authenticate("facebook",{scope: ['email']}));
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/user/login",
    //successRedirect: "/",
    session: true,
  }),
  (req,res) =>  {
    return res.redirect('/')
  }
);
router.post("/logout", (req, res) => {
  if (req.user && req.isAuthenticated()) {
    req.logout(req.user,err => {
      //remove req.user and clears any logged session
      if (err) {
        return next(err);
      }
    });
    return res.status(200).send({message: 'Logout Successfully'})
  }
  if (req.session) {
    req.session.destroy();
    return res.status(200).send({message: 'Logout Successfully'})
  }
});

module.exports = router;
