const db = require('../config/db');

const dashboard = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    if (req.session.user.role !== 'creator') return res.redirect('/viewer/home');

    const userId = req.session.user.id;

    // Get creator info
    const creatorQuery = `SELECT * FROM creator WHERE UserId = ?`;

    db.query(creatorQuery, [userId], (err, creatorResult) => {
        if (err || creatorResult.length === 0) {
            console.error('Creator not found:', err);
            return res.redirect('/auth/login');
        }

        const creator = creatorResult[0];

        // Get creator's videos
        const videosQuery = `
            SELECT v.*, cat.Name AS Category
            FROM video v
            JOIN category cat ON v.CategoryId = cat.Id
            WHERE v.CreatorId = ?
            ORDER BY v.UploadDate DESC
        `;

        db.query(videosQuery, [creator.Id], (err, videos) => {
            if (err) {
                console.error('DB Error:', err.message);
                videos = [];
            }

            // Get stats
            const totalViews    = videos.reduce((sum, v) => sum + v.Views, 0);
            const totalVideos   = videos.length;
            const published     = videos.filter(v => v.Status === 'Published').length;

            res.render('creator/dashboard', {
                user: req.session.user,
                creator,
                videos,
                stats: { totalViews, totalVideos, published,
                         subscribers: creator.TotalSubscribers }
            });
        });
    });
};

module.exports = { dashboard };