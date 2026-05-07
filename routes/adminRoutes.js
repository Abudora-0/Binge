const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/dashboard',          adminController.dashboard);
router.post('/user/status',       adminController.updateUserStatus);
router.get('/video/delete/:id',   adminController.deleteVideo);
router.post('/report/resolve',    adminController.resolveReport);

module.exports = router;