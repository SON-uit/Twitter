const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
module.exports.getAllChat = async function (req, res) {
  let chats = await Chat.find({
    users: { $elemMatch: { $eq: req.session.user._id } },
  })
    .sort({ updateAt: -1 }) // desc
    .populate("users")
    .populate({
      path: "latestMessage",
      populate: [{ path: "sender" }],
    }); // desc
  //get messsage unread (for numberOfMessages in main page)
  if (req.query.unreadOnly !== undefined && req.query.unreadOnly === "true") {
    //chats.forEach(el => console.log(el.latestMessage))
    chats = chats.filter(el => el.latestMessage && !(el.latestMessage.readBy.includes(req.session.user._id)))
  }
  return res.status(200).send(chats);
};
module.exports.getChatById = async function (req, res) {
  const chat = await Chat.findById(req.params.chatId)
    .populate({
      path: "users",
    })
    .populate({
      path: "latestMessage",
      populate: { path: "sender" },
    });
  if (chat) {
    return res.status(200).send(chat);
  } else {
    return res
      .status(404)
      .send({ message: "Can't not find chat with this id." });
  }
};
module.exports.createNewChat = async function (req, res) {
  const users = req.body.users;
  if (!req.body.users || req.body.users.length === 0) {
    return res
      .status(404)
      .send({ message: "Users params not send with request" });
  }
  users.push(req.session.user);
  const chatData = {
    users: users,
    isGroupChat: true,
  };
  const newChat = await Chat.create(chatData);
  return res.status(200).send(newChat);
};
module.exports.updateChatName = async function (req, res) {
  const { chatName } = req.body;
  const chatId = req.params.chatId;
  if (chatName) {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: chatName },
      { new: true }
    );
    return res.status(200).send(updatedChat);
  }
  return res.status(404).send({ message: "Bad Request" });
};
module.exports.getAllMessagesByChatId = async function (req, res) {
  const messages = await Message.find({ chat: req.params.chatId }).populate(
    "sender"
  );
  if (messages) {
    return res.status(200).send(messages);
  } else {
    return res
      .status(404)
      .send({ message: "Can't not find chat with this id." });
  }
};
module.exports.updateUserRead = async function (req, res) {
  const chatId = req.params.chatId;
  await Message.updateMany(
    { chat: chatId },
    { $addToSet: { readBy: req.session.user._id } }
  );
  return res.status(204).send({ message: "Success" });
};
