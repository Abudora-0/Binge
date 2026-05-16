const db = require('../config/db');
const logger = require('../config/logger');
const upload = require('../config/upload');


const dashboard = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    if (req.session.user.role !== 'creator') return res.redirect('/viewer/home');

    const userId = req.session.user.id;

    // Get creator info
    const creatorQuery = `SELECT * FROM creator WHERE UserId = ?`;

    db.query(creatorQuery, [userId], (err, creatorResult) => {
        if (err || creatorResult.length === 0) {
            logger.logError('creatorController', err.message);
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
                logger.logError('creatorController', err.message);
                videos = [];
            }

            // Get stats
            const totalViews = videos.reduce((sum, v) => sum + v.Views, 0);
            const totalVideos = videos.length;
            const published = videos.filter(v => v.Status === 'Published').length;

            res.render('creator/dashboard', {
                user: req.session.user,
                creator,
                videos,
                stats: {
                    totalViews, totalVideos, published,
                    subscribers: creator.TotalSubscribers
                }
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

        // Transaction — insert video + insert tags must both succeed
        db.beginTransaction((err) => {
            if (err) {
                logger.logError('uploadVideo - beginTransaction', err.message);
                return res.redirect('/creator/dashboard');
            }

            const insertVideo = `
            INSERT INTO video (CreatorId, CategoryId, Title, Description, VideoUrl, Duration, Views, Status)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?)
        `;

            db.query(insertVideo,
                [creatorId, categoryId, title, description, videoUrl, duration, status || 'Published'],
                (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            logger.logError('uploadVideo - insert', err.message);
                            res.redirect('/creator/dashboard');
                        });
                    }

                    const videoId = result.insertId;

                    if (tags.length > 0) {
                        const tagValues = tags.map(tagId => [videoId, tagId]);
                        db.query('INSERT INTO videotag (VideoId, TagId) VALUES ?', [tagValues], (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    logger.logError('uploadVideo - tags', err.message);
                                    res.redirect('/creator/dashboard');
                                });
                            }

                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        logger.logError('uploadVideo - commit', err.message);
                                        res.redirect('/creator/dashboard');
                                    });
                                }
                                res.redirect('/creator/dashboard');
                            });
                        });
                    } else {
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    logger.logError('uploadVideo - commit', err.message);
                                    res.redirect('/creator/dashboard');
                                });
                            }
                            res.redirect('/creator/dashboard');
                        });
                    }
                });
        });
    });
};

const showEdit = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const videoId = req.params.id;
    const userId = req.session.user.id;

    db.query('SELECT Id FROM creator WHERE UserId = ?', [userId], (err, result) => {
        if (err || result.length === 0) return res.redirect('/auth/login');

        const creatorId = result[0].Id;

        db.query('SELECT * FROM video WHERE Id = ? AND CreatorId = ?', [videoId, creatorId], (err, videoResult) => {
            if (err || videoResult.length === 0) return res.redirect('/creator/dashboard');

            const video = videoResult[0];

            // Get selected tags for this video
            db.query('SELECT TagId FROM videotag WHERE VideoId = ?', [videoId], (err, tagResult) => {
                video.tags = tagResult ? tagResult.map(t => t.TagId) : [];

                db.query('SELECT * FROM category ORDER BY Name', (err, categories) => {
                    db.query('SELECT * FROM tag ORDER BY Name', (err, tags) => {
                        res.render('creator/upload', {
                            user: req.session.user,
                            categories: categories || [],
                            tags: tags || [],
                            isEdit: true,
                            video,
                            error: null
                        });
                    });
                });
            });
        });
    });
};

const editVideo = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const videoId = req.params.id;
    const userId = req.session.user.id;
    const { title, description, videoUrl, duration, categoryId, status } = req.body;
    let tags = req.body.tags || [];
    if (!Array.isArray(tags)) tags = [tags];

    // Validators
    if (!title || !videoUrl || !duration || !categoryId) {
        return res.redirect('/creator/dashboard');
    }

    db.query('SELECT Id FROM creator WHERE UserId = ?', [userId], (err, result) => {
        if (err || result.length === 0) return res.redirect('/auth/login');

        const creatorId = result[0].Id;

        const updateQuery = `
            UPDATE video
            SET Title = ?, Description = ?, VideoUrl = ?,
                Duration = ?, CategoryId = ?, Status = ?
            WHERE Id = ? AND CreatorId = ?
        `;

        db.query(updateQuery, [title, description, videoUrl, duration, categoryId, status, videoId, creatorId], (err) => {
            if (err) {
                logger.logError('creatorController', err.message);
                return res.redirect('/creator/dashboard');
            }

            // Update tags — delete old then insert new
            db.query('DELETE FROM videotag WHERE VideoId = ?', [videoId], (err) => {
                if (tags.length > 0) {
                    const tagValues = tags.map(tagId => [videoId, tagId]);
                    db.query('INSERT INTO videotag (VideoId, TagId) VALUES ?', [tagValues], (err) => {
                        if (err) logger.logError('creatorController', err.message);
                    });
                }
                res.redirect('/creator/dashboard');
            });
        });
    });
};

const deleteVideo = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const videoId = req.params.id;
    const userId = req.session.user.id;

    db.query('SELECT Id FROM creator WHERE UserId = ?', [userId], (err, result) => {
        if (err || result.length === 0) return res.redirect('/auth/login');

        const creatorId = result[0].Id;

        db.query('DELETE FROM video WHERE Id = ? AND CreatorId = ?', [videoId, creatorId], (err) => {
            if (err) logger.logError('creatorController', err.message);
            res.redirect('/creator/dashboard');
        });
    });
};


const showProfile = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    const userId = req.session.user.id;

    db.query('SELECT * FROM user WHERE Id = ?', [userId], (err, userResult) => {
        if (err || userResult.length === 0) return res.redirect('/creator/dashboard');

        db.query('SELECT * FROM creator WHERE UserId = ?', [userId], (err, creatorResult) => {
            if (err || creatorResult.length === 0) return res.redirect('/creator/dashboard');

            req.session.user.avatar = userResult[0].Avatar;

            res.render('creator/profile', {
                user: req.session.user,
                userData: userResult[0],
                creatorData: creatorResult[0],
                success: null, error: null
            });
        });
    });
};

const updateCreatorAvatar = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    if (!req.file) return res.redirect('/creator/profile');
    const userId = req.session.user.id;

    db.query('UPDATE user SET Avatar = ? WHERE Id = ?', [req.file.filename, userId], (err) => {
        if (err) logger.logError('updateCreatorAvatar', err.message);
        req.session.user.avatar = req.file.filename;
        req.session.save(() => res.redirect('/creator/profile'));
    });
};

const updateCreatorProfile = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    const { firstName, lastName, country } = req.body;
    const userId = req.session.user.id;

    db.query('UPDATE user SET FirstName = ?, LastName = ?, Country = ? WHERE Id = ?',
        [firstName, lastName, country, userId], (err) => {
            if (err) logger.logError('updateCreatorProfile', err.message);
            req.session.user.firstName = firstName;
            req.session.user.lastName  = lastName;
            res.redirect('/creator/profile');
        }
    );
};

const updateChannel = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    const { channelName, bio } = req.body;
    const userId = req.session.user.id;

    db.query('UPDATE creator SET ChannelName = ?, Bio = ? WHERE UserId = ?',
        [channelName, bio, userId], (err) => {
            if (err) logger.logError('updateChannel', err.message);
            res.redirect('/creator/profile');
        }
    );
};

module.exports = { dashboard, showUpload, uploadVideo, showEdit, editVideo, deleteVideo, showProfile, updateCreatorAvatar, updateCreatorProfile, updateChannel };


