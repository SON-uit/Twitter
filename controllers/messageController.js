const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const Notification = require("../models/notificationModel");
function insertNotification(chat, message) {
  return Promise.all(
    chat.users.map(async (userId) => {
      if (message.sender._id.equals(userId)) return;
      await Notification.insertNotification(
        userId,
        message.sender._id,
        "newMessage",
        message.chat._id
      );
    })
  );
}
module.exports.createNewMessage = async (req, res, next) => {
  const { content, chatId } = req.body;
  let newMessage = await Message.create({
    content,
    chat: chatId,
    sender: req.session.user._id,
  });
  newMessage.readBy.push(req.session.user._id);
  await newMessage.save();
  newMessage = await newMessage.populate("sender");
  newMessage = await newMessage.populate({
    path: 'chat',
    populate: [{ path: 'users'},{path: 'latestMessage',populate: { path: "sender" },}]
  })
  const chat = await Chat.findByIdAndUpdate(chatId, {
    latestMessage: newMessage,
  });
  await insertNotification(chat, newMessage);
  return res.status(200).send(newMessage);
};
module.exports.getAllMessages = async (req, res, next) => {
  const { chatId } = req.body;
  if (chatId) {
    const messages = await Message.find({ chat: chatId });
    return res.send(200).send(messages);
  }
  return res.status(404).send({ message: "bad request" });
};
