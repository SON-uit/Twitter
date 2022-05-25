const express = require("express");
const router = express.Router();
const notificationController = require("../../controllers/notificationController")

router.get('/',notificationController.getAllNotification) // get all notifications of each user
router.get('/latest',notificationController.getLatestNotification)
router.put('/:id/markAsOpened',notificationController.updateNotification) // update Notification by notification ID
router.put('/markAsOpened',notificationController.updateNotificationByUserId)// update All Notification of user by userID
module.exports = router;