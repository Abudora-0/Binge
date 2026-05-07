const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creatorController');

router.get('/dashboard',            creatorController.dashboard);
router.get('/upload',               creatorController.showUpload);
router.post('/upload',              creatorController.uploadVideo);
router.get('/video/edit/:id',       creatorController.showEdit);
router.post('/video/edit/:id',      creatorController.editVideo);
router.get('/video/delete/:id',     creatorController.deleteVideo);

module.exports = router;