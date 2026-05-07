const express = require('express');
const router = express.Router();
const viewerController = require('../controllers/viewerController');

router.get('/home',                 viewerController.home);
router.get('/watch/:id',            viewerController.watchVideo);
router.post('/like/:id',            viewerController.likeVideo);
router.post('/subscribe/:id',       viewerController.subscribe);
router.post('/comment/:id',         viewerController.addComment);

module.exports = router;