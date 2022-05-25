const path = require("path");
const fs = require("fs");

const User = require("../models/userModel");
const Notification = require("../models/notificationModel");

module.exports.getAllUser = async (req, res) => {
  const queryObj = req.query;
  if (queryObj.search !== undefined) {
    queryObj.userName = { $regex: req.query.search, $options: "i" };
  }
  const allUser = await User.find(queryObj);
  return res.status(200).send(allUser);
};
module.exports.updateUserFollows = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  if (user === null) return res.status(404);
  const isFollowing =
    user.followers && user.followers.includes(req.session.user._id);
  const option = isFollowing ? "$pull" : "$addToSet";
  // update followings status of current user
  req.session.user = await User.findByIdAndUpdate(
    req.session.user._id,
    {
      [option]: { followings: user._id },
    },
    { new: true }
  );
  // update followers status of user who is followed;
  await User.findByIdAndUpdate(user._id, {
    [option]: { followers: req.session.user._id },
  });
  const type = isFollowing ? "unfollow" : "follow";
  // add notification
  if (!isFollowing) {
    await Notification.insertNotification(
      user._id,
      req.session.user._id,
      "follow", //type,
      req.session.user._id
    );
  }
  return res.status(200).send(req.session.user);
};
module.exports.getUserById = async (req, res) => {
  const userId = req.params.userId;
  const response = await User.findById(userId)
    .populate("followings")
    .populate("followers");
  return res.status(200).send(response);
};
module.exports.updateUserImg = async (req, res) => {
  const userId = req.params.userId;
  if (!req.file) {
    console.log("No file upload in request");
    return res.status(404);
  }
  const filePath = `/uploads/images/${req.file.filename}.png`;
  const storedPath = path.join(__dirname, `../public${filePath}`);
  fs.rename(req.file.path, storedPath, (err) => {
    if (err !== null) return res.status(404);
  });
  req.session.user = await User.findByIdAndUpdate(
    userId,
    { profileImg: filePath },
    { new: true }
  );
  return res.status(200).send("hello");
};
module.exports.updateUserCoverImg = async (req, res) => {
  const userId = req.params.userId;
  if (!req.file) {
    console.log("No file upload in request");
    return res.status(404);
  }
  const filePath = `/uploads/images/${req.file.filename}.png`;
  const storedPath = path.join(__dirname, `../public${filePath}`);
  fs.rename(req.file.path, storedPath, (err) => {
    if (err !== null) return res.status(404);
  });
  req.session.user = await User.findByIdAndUpdate(
    userId,
    { coverProfileImg: filePath },
    { new: true }
  );
  return res.status(200).send("hello");
};
