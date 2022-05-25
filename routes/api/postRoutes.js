const express = require("express");
const router = express.Router();
const postControllers = require('../../controllers/postControllers')
router.get('/',postControllers.getAllPosts);
router.get('/:postId',postControllers.getPostById);
router.post('/',postControllers.createNewPost)
router.post('/:postId/retweet',postControllers.updateRetweetPost);
router.put('/:postId/like',postControllers.updateLikePost);
router.delete('/:postId',postControllers.deletePost)
router.put('/:postId',postControllers.updatePinStatus)
module.exports = router;