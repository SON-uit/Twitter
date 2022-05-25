const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  userName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
  },
  profileImg: {
    type: String,
    default: "/images/profile.jpg",
  },
  coverProfileImg: {
    type: String,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  retweets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  followings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  googleId: {
    type:String,
  },
  facebookId: {
    type:String,
  }
},{timestamps:true},);

UserSchema.pre('save',async function (next)  {
  if(this.password) {
    this.password = await bcrypt.hash(this.password,10);
  }
  next();
})
UserSchema.methods.validatePassword = async function validatePassword(data) {
  return bcrypt.compare(data, this.password);
};
const User = mongoose.model("User", UserSchema);

module.exports = User;