const express = require('express');
const router = express.Router();
const viewerController = require('../controllers/viewerController');

router.get('/home',                 viewerController.home);
router.get('/watch/:id',            viewerController.watchVideo);
router.post('/like/:id',            viewerController.likeVideo);
router.post('/subscribe/:id',       viewerController.subscribe);
router.post('/comment/:id',         viewerController.addComment);
router.get('/subscriptions', viewerController.subscriptions);
router.get('/history',       viewerController.history);
router.get('/playlists',     viewerController.playlists);
router.post('/playlist/create', viewerController.createPlaylist);

module.exports = router;