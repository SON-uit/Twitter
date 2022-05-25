const User = require("../models/userModel");
const Post = require("../models/postModel");
const Notification = require("../models/notificationModel");
module.exports.getAllPosts = async (req, res) => {
  let queryObj = req.query;
  //check if exsist isReply in query
  if (queryObj.isReply !== undefined) {
    const isReply = queryObj.isReply === "true";
    // find doc have  replyToPost fields
    queryObj.replyToPost = { $exists: isReply };
    delete queryObj.isReply;
  }
  if (queryObj.search !== undefined) {
    queryObj.content = { $regex: queryObj.search, $options: "i" };
    delete queryObj.search;
  }
  if (queryObj.isFollwingOnly !== undefined) {
    const isFollwingOnly = queryObj.isFollwingOnly === "true";
    if (isFollwingOnly) {
      const objectIds = { ...req.session.user };
      // add userLogged into posted query
      objectIds.followings.push(req.session.user._id);
      queryObj.postedBy = { $in: objectIds.followings };
    }
    delete queryObj.isFollwingOnly;
  }
  try {
    const allPost = await Post.find(queryObj)
      .sort("createdAt")
      .populate({
        path: "postedBy",
      })
      .populate({
        path: "retweetData",
        populate: { path: "postedBy" },
      })
      .populate({
        path: "replyToPost",
        populate: { path: "postedBy" },
      });
    return res.status(200).send(allPost);
  } catch (err) {
    console.log(err);
  }
  console.log(response);
  return res.status(404);
};
module.exports.getPostById = async (req, res) => {
  try {
    const postData = await Post.findOne({ _id: req.params.postId })
      .populate({
        path: "postedBy",
      })
      .populate({
        path: "retweetData",
        populate: { path: "postedBy" },
      })
      .populate({
        path: "replyToPost",
        populate: { path: "postedBy" },
      });
    const replies = await Post.find({ replyToPost: req.params.postId })
      .populate({
        path: "postedBy",
      })
      .populate({
        path: "retweetData",
        populate: { path: "postedBy" },
      })
      .populate({
        path: "replyToPost",
        populate: { path: "postedBy" },
      })
      .sort({createdAt: 1});
    const response = {
      postData,
      replies,
    };
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
  }
  console.log(response);
  return res.status(404);
};
module.exports.createNewPost = async (req, res) => {
  if (!req.body.content) {
    return res.status(404).send("Bad Request");
  }
  const post = {
    content: req.body.content,
    postedBy: req.session.user._id,
  };
  if (req.body.replyTo) {
    post.replyToPost = req.body.replyTo;
  }
  try {
    let newPost = await Post.create(post);
    newPost = await newPost.populate('postedBy');
    newPost = await newPost.populate({
      path: 'replyToPost',
      populate: { path: 'postedBy'},
    });
    if (newPost.replyToPost !== undefined) {
      await Notification.insertNotification(
        newPost.replyToPost.postedBy._id,
        req.session.user._id,
        "reply",
        req.body.replyTo
      );
    }
    return res.status(201).send(newPost);
  } catch (err) {
    console.log(err);
    return res.status(404).send("Error");
  }
};
module.exports.updateLikePost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.session.user._id;
  const isLiked =
    req.session.user.likes && req.session.user.likes.includes(postId);
  //insert user like
  const option = isLiked ? "$pull" : "$addToSet";
  //pull remove value from array
  //addToSet add value to array
  //use Variable into query string in mongo user [variable]
  try {
    req.session.user = await User.findByIdAndUpdate(
      userId,
      {
        [option]: { likes: postId },
      },
      { new: true }
    ); //
    //insert post likes
    let post = await Post.findByIdAndUpdate(
      postId,
      {
        [option]: { likes: userId },
      },
      { new: true }
    );
    post = await post.populate('postedBy');
    post = await post.populate({
      path: 'replyToPost',
      populate: {path: 'postedBy'},
    })
    // add notification
    if (!isLiked) {
      await Notification.insertNotification(
        post.postedBy._id,
        userId,
        "postLike",
        post._id
      );
    }
    return res.status(200).send(post);
  } catch {
    return res.status(404);
  }
};
module.exports.updateRetweetPost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.session.user._id;
  // try and delete tweet
  //if user already retweet -> delete previous tweet else -> create new retweet
  const deletePost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetData: postId,
  });
  const option = deletePost !== null ? "$pull" : "$addToSet";
  let repost = deletePost;
  if (repost === null) {
    repost = await Post.create({ postedBy: userId, retweetData: postId });
  }
  req.session.user = await User.findByIdAndUpdate(
    userId,
    {
      [option]: { retweets: repost._id },
    },
    { new: true }
  );
  let post = await Post.findByIdAndUpdate(
    postId,
    {
      [option]: { retweetUsers: userId },
    },
    { new: true }
  );
  post = await post.populate('postedBy');
  post = await post.populate({
    path: 'replyToPost',
    populate: {path: 'postedBy'},
  })
  if (!deletePost) {
    await Notification.insertNotification(
      post.postedBy._id,
      userId,
      "retweet",
      post._id
    );
  }
  return res.status(200).send(post);
};
module.exports.deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).send({ message: "Delete post successfully" });
  } catch {
    res.status(404).send({ message: "BadRequest" });
  }
};
module.exports.updatePinStatus = async (req, res) => {
  if (req.body.pinned !== undefined) {
    await Post.updateMany(
      { posstedBy: req.session.user._id },
      { pinned: false }
    ).catch((err) => {
      console.log(err);
      return res.status(404);
    });
  }
  await Post.findByIdAndUpdate(req.params.postId, req.body).catch((err) => {
    console.log(err);
    return res.status(404);
  });
  return res.status(200).send("Pin update");
};
