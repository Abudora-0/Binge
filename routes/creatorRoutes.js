const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creatorController');
const upload = require('../config/upload');

router.get('/dashboard',            creatorController.dashboard);
router.get('/upload',               creatorController.showUpload);
router.post('/upload',              creatorController.uploadVideo);
router.get('/video/edit/:id',       creatorController.showEdit);
router.post('/video/edit/:id',      creatorController.editVideo);
router.get('/video/delete/:id',     creatorController.deleteVideo);
router.get('/profile',              creatorController.showProfile);
router.post('/profile/avatar',      upload.single('avatar'), creatorController.updateCreatorAvatar);
router.post('/profile/update',      creatorController.updateCreatorProfile);
router.post('/profile/channel',     creatorController.updateChannel);

module.exports = router;