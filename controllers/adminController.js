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

        // Get all users — never select Password
        const usersQuery = `
            SELECT u.Id, u.FirstName, u.LastName, u.Email, u.Country,
                   u.Status, u.Avatar, u.JoinDate,
                   CASE WHEN c.Id IS NOT NULL THEN 'Creator' ELSE 'Viewer' END AS Role
            FROM user u
            LEFT JOIN creator c ON c.UserId = u.Id
            ORDER BY u.JoinDate DESC
        `;

        db.query(usersQuery, (err, allUsers) => {
            if (err) allUsers = [];

            // Get all videos
            const videosQuery = `
                SELECT v.Id, v.Title, v.Views, v.Status, v.UploadDate, v.VideoUrl,
                       c.ChannelName, cat.Name AS Category
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

                            // ── Audit log: recent delete/suspend actions ──
                            db.query(
                                `SELECT a.*, u.FirstName, u.LastName
                                 FROM auditlog a
                                 LEFT JOIN user u ON a.PerformedBy = u.Id
                                 ORDER BY a.LoggedAt DESC
                                 LIMIT 50`,
                                (err, auditLog) => {
                                    if (err) auditLog = [];

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
                                        creatorsOverview,
                                        auditLog
                                    });
                                }
                            );
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
    const adminId = req.session.user.id;

    // Never allow suspending the admin account itself
    if (parseInt(userId) === adminId) {
        return res.redirect('/admin/dashboard');
    }

    db.query('SELECT FirstName, LastName FROM user WHERE Id = ?', [userId], (err, rows) => {
        const userName = (!err && rows.length) ? `${rows[0].FirstName} ${rows[0].LastName}` : `User #${userId}`;

        db.query('UPDATE user SET Status = ? WHERE Id = ?', [status, userId], (err) => {
            if (err) { logger.logError('adminController.updateUserStatus', err.message); }

            // Log the status change to auditlog
            db.query(
                'INSERT INTO auditlog (Action, EntityType, EntityId, EntityName, PerformedBy, Details) VALUES (?, ?, ?, ?, ?, ?)',
                [status === 'Suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER', 'user', userId, userName, adminId,
                 `Status changed to ${status}`],
                (err) => { if (err) logger.logError('adminController.updateUserStatus - auditlog', err.message); }
            );
            res.redirect('/admin/dashboard');
        });
    });
};

const deleteVideo = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/auth/login');

    const videoId  = req.params.id;
    const adminId  = req.session.user.id;

    // Set session variable so trg_LogVideoDelete knows who deleted it
    db.query('SET @binge_deleted_by = ?', [adminId], () => {
        db.query('DELETE FROM video WHERE Id = ?', [videoId], (err) => {
            if (err) logger.logError('adminController.deleteVideo', err.message);
            res.redirect('/admin/dashboard');
        });
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