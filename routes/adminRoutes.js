const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/dashboard',          adminController.dashboard);
router.post('/user/status',       adminController.updateUserStatus);
router.get('/video/delete/:id',   adminController.deleteVideo);
router.post('/report/resolve',    adminController.resolveReport);

router.get('/reports', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/auth/login');
    res.render('admin/reports', { user: req.session.user });
});

module.exports = router;