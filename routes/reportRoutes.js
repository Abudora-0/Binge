const express = require('express');
const router = express.Router();
const rc = require('../controllers/reportController');

router.get('/trending',     rc.trendingVideos);
router.get('/creators',     rc.topCreators);
router.get('/categories',   rc.categoryEngagement);
router.get('/engagement',   rc.videoEngagement);
router.get('/monthly',      rc.monthlyWatch);
router.get('/users',        rc.allUsers);
router.get('/videos',       rc.allVideos);
router.get('/comments',     rc.commentActivity);
router.get('/subscriptions',rc.subscriptions);
router.get('/moderation',   rc.moderationReport);

module.exports = router;