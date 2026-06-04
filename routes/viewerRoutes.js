const express = require('express');
const router = express.Router();
const viewerController = require('../controllers/viewerController');
const upload = require('../config/upload');

router.get('/home',                 viewerController.home);
router.get('/watch/:id',            viewerController.watchVideo);
router.post('/like/:id',            viewerController.likeVideo);
router.post('/subscribe/:id',       viewerController.subscribe);
router.post('/comment/:id',         viewerController.addComment);
router.get('/subscriptions', viewerController.subscriptions);
router.get('/history',              viewerController.history);
router.post('/history/delete',      viewerController.deleteHistoryItem);
router.post('/history/clear',       viewerController.clearHistory);
router.get('/playlists',     viewerController.playlists);
router.post('/playlist/create', viewerController.createPlaylist);
router.post('/report/:id', viewerController.reportVideo);
router.get('/profile',                viewerController.showProfile);
router.post('/profile/avatar', (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err) {
            const msg = err.code === 'LIMIT_FILE_SIZE'
                ? 'File too large. Maximum size is 5MB.'
                : 'Invalid file type. Please upload a JPEG, PNG, GIF, or WEBP image.';
            return res.redirect('/viewer/profile?error=' + encodeURIComponent(msg));
        }
        next();
    });
}, viewerController.updateAvatar);
router.post('/profile/update',        viewerController.updateProfile);
router.get('/channel/:id',            viewerController.channelPage);
router.post('/playlist/add',     viewerController.addToPlaylist);
router.get('/playlist/:id',      viewerController.getPlaylist);
router.post('/playlist/remove',  viewerController.removeFromPlaylist);

module.exports = router;