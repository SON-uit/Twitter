const Notification = require("../models/notificationModel");

module.exports.getAllNotification = async (req, res) => {
  try {
    const searchObj = {
      userTo: req.session.user._id,
      notificationType: { $ne: "newMessage" },
    }
    if(req.query.unreadOnly !== undefined && req.query.unreadOnly === 'true') {
      searchObj.opened = false;
    }
    let notifications = await Notification.find(searchObj)
      .populate("userTo")
      .populate("userFrom")
      .populate("entityId")
      .sort({createdAt: 1}); // desc
      notifications = notifications.filter(el => !el.userTo._id.equals(el.userFrom._id));
    return res.status(200).send(notifications);
  } catch (err) {
    return res.status(404).send({ message: err.message });
  }
};
module.exports.updateNotification = async (req, res) => {
  const notificationId = req.params.id;
  await Notification.findByIdAndUpdate(notificationId, { opened: true });
  return res.status(204).send({ message: "Success" });
};
module.exports.updateNotificationByUserId = async (req, res) => {
  await Notification.updateMany(
    { userTo: req.session.user._id },
    { opened: true }
  );
  return res.status(204).send({ message: "Success" });
};
module.exports.getLatestNotification = async (req, res) => {
  try {
    let notifications = await Notification.findOne({userTo: req.session.user._id})
      .populate("userTo")
      .populate("userFrom")
      .populate("entityId")
      .sort({createdAt: -1}); // desc
    return res.status(200).send(notifications);
  } catch (err) {
    return res.status(404).send({ message: err.message });
  }
};