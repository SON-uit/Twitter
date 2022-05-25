const passport = require("passport"); // passport is middleware
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel")

const AUTH_OPTIONS = {
  clientID: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  callbackURL: "/api/auths/google/callback",
};
// function dc call sau khi dang nhap thanh cong
async function verifyCallback(accessToken, refreshToken, profile, done) {
  const {id,emails,displayName,name, photos } = profile;
  //console.log(id,emails,displayName,familyName, givenName, photos);
  const newUser  = {
    googleId: id,
    userName: displayName,
    firstName: name.familyName,
    lastName: name.givenName,
    email: emails[0].value,
    profileImg: photos[0].value,
   }
   try {
      // check if existing user
    let user = await User.findOne({googleId: profile.id});
    if(user) { 
        done(null,user)
    }else {
    user = await User.create(newUser)
        done(null,user)
    }
  }catch(err) {
      console.error(err)
  }
  /* console.log(newUser)
  console.log("Google profile", profile); */
}
// verifyCallback run before serializeUser
// value user of serializeUser = done(null,user) on verifyCallback

////serializing: save the session to cookie and send to client
passport.serializeUser((user, done) => {
  done(null, user.googleId);
}); 
/// deserializeUser: read the session from coookie
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({googleId: id})
    if(user) {
      done(null,user)
    } 
  } catch (err) {
    console.error(err);
  }
});
passport.use(new GoogleStrategy(AUTH_OPTIONS, verifyCallback));
