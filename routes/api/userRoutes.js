const express = require("express");
const multer = require("multer");
const upload = multer({dest: "public/uploads/"})
const router = express.Router();
const userControllers = require("../../controllers/userControllers");
router.get('/',userControllers.getAllUser)
router.put('/:userId/follow',userControllers.updateUserFollows);
router.get('/:userId',userControllers.getUserById)
router.put('/:userId/img', upload.single("croppedImg"),userControllers.updateUserImg)
router.put('/:userId/coverImg', upload.single("croppedImg"),userControllers.updateUserCoverImg)
module.exports = router;
