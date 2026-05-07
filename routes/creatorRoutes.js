const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creatorController');

router.get('/dashboard', creatorController.dashboard);

module.exports = router;