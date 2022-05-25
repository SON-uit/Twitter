const passport = require("passport"); // passport is middleware
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require("../models/userModel")

const AUTH_OPTIONS = {
    clientID: process.env.OAUTH_FB_CLIENT_ID,
    clientSecret: process.env.OAUTH_FB_SECRET,
    callbackURL: "/api/auths/facebook/callback",
    profileFields: ['id','email','name','photos']
  };
  // function dc call sau khi dang nhap thanh cong
  async function verifyCallback(accessToken, refreshToken, profile, done) {
    const {id,emails,displayName,name, photos } = profile;
    const newUser  = {
      facebookId: id,
      userName: displayName || `${name.givenName} ${name.familyName}1`,
      firstName: name.familyName,
      lastName: name.givenName,
      email: `${emails[0].value}1`,
      profileImg: photos[0].value,
     }
     try {
        // check if existing user
      let user = await User.findOne({facebookId: id});
      if(user) { 
          done(null,user)
      }else {
      user = await User.create(newUser)
          done(null,user)
      }
    }catch(err) {
        console.error(err)
    }
    //console.log("Facebook profile", profile); 
  }
  // verifyCallback run before serializeUser
  // value user of serializeUser = done(null,user) on verifyCallback
  
  ////serializing: save the session to cookie and send to client
  passport.serializeUser((user, done) => {
    done(null, user.facebookId);
  }); 
  /// deserializeUser: read the session from coookie
  passport.deserializeUser(async (id, done) => {
    console.log(id);
    try {
      const user = await User.findOne({facebookId: id})
      console.log(user);
      if(user) {
        done(null,user)
      } 
    } catch (err) {
      console.error(err);
    }
  });
  passport.use(new FacebookStrategy(AUTH_OPTIONS, verifyCallback));
  