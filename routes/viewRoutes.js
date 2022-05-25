const express = require("express");
const authController = require('../controllers/authController');
const viewController = require('../controllers/viewController');
const router = express.Router();

router.get("/user/login",viewController.renderLoginForm)
router.get("/user/register",viewController.renderRegisterForm)
router.post("/user/login", authController.login);
router.post("/user/register", authController.register);
router.post('/logout', authController.logout);


router.use(authController.isLogin)
router.get('/',viewController.renderHomeView)
router.get('/post/:postId',viewController.renderPostView)
router.get('/profile/:userId',viewController.renderProfileView);
router.get('/profile/:userId/follow',viewController.renderProfileFollowView)
router.get('/search',viewController.renderSearchView)

router.get('/messages/',viewController.renderMessageView)
router.get('/messages/new',viewController.renderNewMessageView)
router.get('/messages/:chatId',viewController.renderChatView)
router.get('/notification',viewController.renderNotificationView)
module.exports = router