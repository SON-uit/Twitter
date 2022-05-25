const express = require("express");
const router = express.Router();
const chatControllers = require('../../controllers/chatController')

router.get('/',chatControllers.getAllChat)
router.get('/:chatId/messages',chatControllers.getAllMessagesByChatId)
router.post('/',chatControllers.createNewChat)
router.get('/:chatId',chatControllers.getChatById)
router.put('/:chatId',chatControllers.updateChatName)
router.put('/:chatId/messages/markAsRead',chatControllers.updateUserRead)
module.exports = router;