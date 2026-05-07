const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creatorController');

router.get('/dashboard', creatorController.dashboard);

router.get('/upload',  creatorController.showUpload);
router.post('/upload', creatorController.uploadVideo);

module.exports = router;