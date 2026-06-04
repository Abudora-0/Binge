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
router.post('/profile/avatar', (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err) {
            const msg = err.code === 'LIMIT_FILE_SIZE'
                ? 'File too large. Maximum size is 5MB.'
                : 'Invalid file type. Please upload a JPEG, PNG, GIF, or WEBP image.';
            return res.redirect('/creator/profile?error=' + encodeURIComponent(msg));
        }
        next();
    });
}, creatorController.updateCreatorAvatar);
router.post('/profile/update',      creatorController.updateCreatorProfile);
router.post('/profile/channel',     creatorController.updateChannel);

module.exports = router;