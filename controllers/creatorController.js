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

const showUpload = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    // Get categories and tags
    db.query('SELECT * FROM category ORDER BY Name', (err, categories) => {
        if (err) categories = [];
        db.query('SELECT * FROM tag ORDER BY Name', (err, tags) => {
            if (err) tags = [];
            res.render('creator/upload', {
                user: req.session.user,
                categories,
                tags,
                isEdit: false,
                video: {},
                error: null
            });
        });
    });
};

const uploadVideo = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const { title, description, videoUrl, duration, categoryId, status } = req.body;
    let tags = req.body.tags || [];
    if (!Array.isArray(tags)) tags = [tags];
    const userId = req.session.user.id;

    // ── Validators ──
    if (!title || !videoUrl || !duration || !categoryId) {
        return db.query('SELECT * FROM category', (err, categories) => {
            db.query('SELECT * FROM tag', (err2, tagList) => {
                res.render('creator/upload', {
                    user: req.session.user,
                    categories: categories || [],
                    tags: tagList || [],
                    isEdit: false,
                    video: {},
                    error: 'Title, URL, Duration and Category are required.'
                });
            });
        });
    }

    if (title.length < 3) {
        return db.query('SELECT * FROM category', (err, categories) => {
            db.query('SELECT * FROM tag', (err2, tagList) => {
                res.render('creator/upload', {
                    user: req.session.user,
                    categories: categories || [],
                    tags: tagList || [],
                    isEdit: false,
                    video: {},
                    error: 'Title must be at least 3 characters.'
                });
            });
        });
    }

    if (isNaN(duration) || duration <= 0) {
        return db.query('SELECT * FROM category', (err, categories) => {
            db.query('SELECT * FROM tag', (err2, tagList) => {
                res.render('creator/upload', {
                    user: req.session.user,
                    categories: categories || [],
                    tags: tagList || [],
                    isEdit: false,
                    video: {},
                    error: 'Duration must be a positive number.'
                });
            });
        });
    }

    // Get creator ID
    db.query('SELECT Id FROM creator WHERE UserId = ?', [userId], (err, result) => {
        if (err || result.length === 0) return res.redirect('/auth/login');

        const creatorId = result[0].Id;

        const insertVideo = `
            INSERT INTO video (CreatorId, CategoryId, Title, Description, VideoUrl, Duration, Views, Status)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?)
        `;

        db.query(insertVideo, [creatorId, categoryId, title, description, videoUrl, duration, status || 'Published'], (err, result) => {
            if (err) {
                console.error('DB Error:', err.message);
                return res.redirect('/creator/dashboard');
            }

            const videoId = result.insertId;

            // Insert tags
            if (tags.length > 0) {
                const tagValues = tags.map(tagId => [videoId, tagId]);
                db.query('INSERT INTO videotag (VideoId, TagId) VALUES ?', [tagValues], (err) => {
                    if (err) console.error('Tag insert error:', err.message);
                });
            }

            res.redirect('/creator/dashboard');
        });
    });
};

module.exports = { dashboard, showUpload, uploadVideo };

