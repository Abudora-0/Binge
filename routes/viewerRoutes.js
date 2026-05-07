const express = require('express');
const router = express.Router();
const viewerController = require('../controllers/viewerController');

router.get('/home', viewerController.home);

module.exports = router;