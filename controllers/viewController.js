const { restart } = require("nodemon");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const mongoose = require("mongoose");
module.exports.renderLoginForm = (req, res) => {
  res.render("login");
};
module.exports.renderRegisterForm = (req, res) => {
  res.render("register");
};
module.exports.renderHomeView = (req, res) => {
  const payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
  };
  res.status(200).render("home", payload);
};
module.exports.renderPostView = (req, res) => {
  const payload = {
    pageTitle: "View Post",
    userLoggedIn: req.session.user,
    postId: req.params.postId,
  };
  res.status(200).render("postPage", payload);
};
module.exports.renderProfileView = async (req, res) => {
  const user = await User.findById(req.params.userId);
  const payload = {
    pageTitle: "Profile",
    userLoggedIn: req.session.user,
    profile: user,
  };
  res.status(200).render("profilePage", payload);
};
module.exports.renderProfileFollowView = async (req, res) => {
  const user = await User.findById(req.params.userId);
  const payload = {
    pageTitle: "Profile",
    userLoggedIn: req.session.user,
    profile: user,
  };
  res.status(200).render("followingAndFollower", payload);
};
module.exports.renderSearchView = async (req, res) => {
  const payload = {
    pageTitle: "Search",
    userLoggedIn: req.session.user,
  };
  res.status(200).render("searchPage", payload);
};
module.exports.renderMessageView = async (req, res) => {
  const payload = {
    pageTitle: "Message",
    userLoggedIn: req.session.user,
  };
  res.status(200).render("inboxPage", payload);
};
module.exports.renderNewMessageView = async (req, res) => {
  const payload = {
    pageTitle: "Message",
    userLoggedIn: req.session.user,
  };
  res.status(200).render("newMessage", payload);
};
module.exports.renderChatView = async (req, res) => {
  const userId = req.session.user._id;
  const chatId = req.params.chatId;
  const isValidId = mongoose.isValidObjectId(chatId);
  const payload = {
    pageTitle: "Chat Page",
    userLoggedIn: req.session.user,
  };
  // check if validId in mongodb
  if (!isValidId) {
    payload.errorMessage = "Chat does not exist";
    return res.status(200).render("chatPage", payload);
  }

  let chat = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: userId } },
  }).populate("users");
  if (chat === null) {
    // check if that id is  userId
    const userFound = await User.findById(chatId);
    if (userFound !== null) {
      ///
      chat = await getChatByUserId(userFound._id,userId);
    }
  }
  if (chat === null) {
    payload.errorMessage = "Chat does not exist";
  } else {
    payload.chat = chat;
  }
  res.status(200).render("chatPage", payload);
};
function getChatByUserId(userLoggedInId, otherUserId) {
  return Chat.findOneAndUpdate(
    {
      isGroupChat: false,
      users: {
        $size: 2,
        $all: [
          { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
          { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } },
        ],
      },
    },
    {
      $setOnInsert: { // setOnInsert work when upset work(if don't have document with filter)
        users: [userLoggedInId, otherUserId],
      },
    },
    {
      new: true,
      upsert: true, // if dont' have document with filter->>get new document with this filter
    }
  ).populate("users");
}


module.exports.renderNotificationView = async(req,res) => {
  const payload = {
    pageTitle: "Notification",
    userLoggedIn: req.session.user,
  };
  res.status(200).render("notification", payload);
};
