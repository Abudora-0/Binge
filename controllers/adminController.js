const db = require('../config/db');
const logger = require('../config/logger');

const dashboard = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    if (req.session.user.role !== 'admin') return res.redirect('/viewer/home');

    // Get platform stats
    const statsQueries = [
        'SELECT COUNT(*) AS total FROM user',
        'SELECT COUNT(*) AS total FROM video',
        'SELECT COUNT(*) AS total FROM creator',
        'SELECT COUNT(*) AS total FROM comment',
        'SELECT COALESCE(SUM(Views), 0) AS total FROM video',
        'SELECT COUNT(*) AS total FROM report WHERE Status = "Pending"',
    ];

    Promise.all(statsQueries.map(q => new Promise((resolve, reject) => {
        db.query(q, (err, result) => {
            if (err) reject(err);
            else resolve(result[0]);
        });
    }))).then(([users, videos, creators, comments, views, reports]) => {

        // Get all users
        const usersQuery = `
            SELECT u.*, 
                   CASE WHEN c.Id IS NOT NULL THEN 'Creator' ELSE 'Viewer' END AS Role
            FROM user u
            LEFT JOIN creator c ON c.UserId = u.Id
            ORDER BY u.JoinDate DESC
        `;

        db.query(usersQuery, (err, allUsers) => {
            if (err) allUsers = [];

            // Get all videos
            const videosQuery = `
                SELECT v.*, c.ChannelName, cat.Name AS Category
                FROM video v
                JOIN creator c    ON v.CreatorId  = c.Id
                JOIN category cat ON v.CategoryId = cat.Id
                ORDER BY v.UploadDate DESC
            `;

            db.query(videosQuery, (err, allVideos) => {
                if (err) allVideos = [];

                // Get pending reports
                const reportsQuery = `
                    SELECT r.*, u.FirstName, u.LastName, v.Title AS VideoTitle, v.VideoUrl AS VideoUrl
                    FROM report r
                    JOIN user u  ON r.ReportedBy = u.Id
                    JOIN video v ON r.VideoId    = v.Id
                    WHERE r.Status = 'Pending'
                    ORDER BY r.ReportedAt DESC
                `;

                db.query(reportsQuery, (err, pendingReports) => {
                    if (err) pendingReports = [];

                    // ── vw_CreatorDashboard: per-creator stats for the Creators tab ──
                    db.query(
                        'SELECT * FROM vw_CreatorDashboard ORDER BY TotalSubscribers DESC',
                        (err, creatorsOverview) => {
                            if (err) creatorsOverview = [];

                            res.render('admin/dashboard', {
                                user: req.session.user,
                                stats: {
                                    users:    users.total,
                                    videos:   videos.total,
                                    creators: creators.total,
                                    comments: comments.total,
                                    views:    views.total,
                                    reports:  reports.total
                                },
                                allUsers,
                                allVideos,
                                pendingReports,
                                creatorsOverview
                            });
                        }
                    );
                });
            });
        });
    }).catch(err => {
        logger.logError('adminController', err.message);
        res.redirect('/auth/login');
    });
};

const updateUserStatus = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/auth/login');

    const { userId, status } = req.body;

    // Never allow suspending the admin account itself
    if (parseInt(userId) === req.session.user.id) {
        return res.redirect('/admin/dashboard');
    }

    db.query('UPDATE user SET Status = ? WHERE Id = ?', [status, userId], (err) => {
        if (err) logger.logError('adminController', err.message);
        res.redirect('/admin/dashboard');
    });
};

const deleteVideo = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/auth/login');

    const videoId = req.params.id;
    db.query('DELETE FROM video WHERE Id = ?', [videoId], (err) => {
        if (err) logger.logError('adminController', err.message);
        res.redirect('/admin/dashboard');
    });
};

const resolveReport = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/auth/login');

    const { reportId, status } = req.body;
    db.query('UPDATE report SET Status = ? WHERE Id = ?', [status, reportId], (err) => {
        if (err) logger.logError('adminController', err.message);
        res.redirect('/admin/dashboard');
    });
};

module.exports = { dashboard, updateUserStatus, deleteVideo, resolveReport };