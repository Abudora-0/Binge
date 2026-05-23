const db        = require('../config/db');
const logger    = require('../config/logger');
const upload    = require('../config/upload');
const Video     = require('../models/Video');
const Creator   = require('../models/Creator');
const Validator = require('../config/Validator');


const dashboard = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    if (req.session.user.role !== 'creator') return res.redirect('/viewer/home');

    const userId = req.session.user.id;

    Creator.findByUserId(userId, (err, creator) => {
        if (err || !creator) {
            logger.logError('creatorController.dashboard', err ? err.message : 'Creator not found');
            return res.redirect('/auth/login');
        }

        // ── Call sp_GetCreatorStats — returns TotalVideos, TotalViews, TotalLikes, PublishedVideos, Subscribers ──
        db.query('CALL sp_GetCreatorStats(?)', [creator.id], (err, spResult) => {
            if (err) logger.logError('creatorController.dashboard - sp_GetCreatorStats', err.message);
            const sp = (!err && spResult && spResult[0] && spResult[0][0]) ? spResult[0][0] : null;

            // Still fetch video list for the dashboard table display
            Video.findByCreator(creator.id, (err, videos) => {
                if (err) {
                    logger.logError('creatorController.dashboard - videos', err.message);
                    videos = [];
                }

                res.render('creator/dashboard', {
                    user: req.session.user,
                    creator,
                    videos,
                    stats: {
                        totalVideos:  sp ? sp.TotalVideos     : videos.length,
                        totalViews:   sp ? sp.TotalViews      : videos.reduce((s, v) => s + (v.views || 0), 0),
                        totalLikes:   sp ? sp.TotalLikes      : videos.reduce((s, v) => s + (v.likeCount || 0), 0),
                        published:    sp ? sp.PublishedVideos : videos.filter(v => v.isPublished()).length,
                        subscribers:  sp ? sp.Subscribers     : creator.totalSubscribers
                    }
                });
            });
        });
    });
};

const showUpload = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    const userId = req.session.user.id;

    Creator.findByUserId(userId, (err, creator) => {
        db.query('SELECT * FROM category ORDER BY Name', (err, categories) => {
            if (err) categories = [];
            db.query('SELECT * FROM tag ORDER BY Name', (err, tags) => {
                if (err) tags = [];
                res.render('creator/upload', {
                    user: req.session.user,
                    creator: creator || null,
                    categories,
                    tags,
                    isEdit: false,
                    video: {},
                    error: null
                });
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

    // ── Reusable error renderer ──
    const renderError = (msg) => {
        Creator.findByUserId(userId, (err, creator) => {
            db.query('SELECT * FROM category ORDER BY Name', (err, categories) => {
                db.query('SELECT * FROM tag ORDER BY Name', (err, tagList) => {
                    res.render('creator/upload', {
                        user: req.session.user, creator: creator || null,
                        categories: categories || [], tags: tagList || [],
                        isEdit: false, video: req.body, error: msg
                    });
                });
            });
        });
    };

    // ── Validate using Validator class ──
    const validation = Validator.validateVideoUpload({ title, videoUrl, duration, categoryId });
    if (!validation.valid) return renderError(validation.message);

    Creator.findByUserId(userId, (err, creator) => {
        if (err || !creator) return res.redirect('/auth/login');

        // ── Call stored procedure sp_UploadVideo ──
        // sp_UploadVideo inserts the video row atomically and returns the new VideoId
        db.query(
            `CALL sp_UploadVideo(?, ?, ?, ?, ?, ?, ?, @videoId)`,
            [creator.id, categoryId, title, description || '', videoUrl, parseInt(duration), status || 'Published'],
            (err) => {
                if (err) {
                    logger.logError('creatorController.uploadVideo - sp_UploadVideo', err.message);
                    return renderError('Upload failed. Please try again.');
                }

                // Retrieve the OUT parameter
                db.query('SELECT @videoId AS videoId', (err, result) => {
                    if (err || !result || result[0].videoId <= 0) {
                        logger.logError('creatorController.uploadVideo - OUT param', err ? err.message : 'No videoId');
                        return res.redirect('/creator/dashboard');
                    }

                    const videoId = result[0].videoId;

                    // Insert tag associations if any tags were selected
                    if (tags.length > 0) {
                        const tagValues = tags.map(tagId => [videoId, tagId]);
                        db.query('INSERT IGNORE INTO videotag (VideoId, TagId) VALUES ?', [tagValues], (err) => {
                            if (err) logger.logError('creatorController.uploadVideo - tags', err.message);
                            res.redirect('/creator/dashboard');
                        });
                    } else {
                        res.redirect('/creator/dashboard');
                    }
                });
            }
        );
    });
};

const showEdit = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const videoId = req.params.id;
    const userId  = req.session.user.id;

    Creator.findByUserId(userId, (err, creator) => {
        if (err || !creator) return res.redirect('/auth/login');

        db.query('SELECT * FROM video WHERE Id = ? AND CreatorId = ?', [videoId, creator.id], (err, videoResult) => {
            if (err || videoResult.length === 0) return res.redirect('/creator/dashboard');

            const video = videoResult[0];

            db.query('SELECT TagId FROM videotag WHERE VideoId = ?', [videoId], (err, tagResult) => {
                video.tags = tagResult ? tagResult.map(t => t.TagId) : [];

                db.query('SELECT * FROM category ORDER BY Name', (err, categories) => {
                    db.query('SELECT * FROM tag ORDER BY Name', (err, tags) => {
                        res.render('creator/upload', {
                            user: req.session.user,
                            creator,
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
    const userId  = req.session.user.id;
    const { title, description, videoUrl, duration, categoryId, status } = req.body;
    let tags = req.body.tags || [];
    if (!Array.isArray(tags)) tags = [tags];

    const validation = Validator.validateVideoUpload({ title, videoUrl, duration, categoryId });
    if (!validation.valid) return res.redirect('/creator/dashboard');

    Creator.findByUserId(userId, (err, creator) => {
        if (err || !creator) return res.redirect('/auth/login');

        // ── Wrap update + tag replacement in a transaction ──
        db.beginTransaction((err) => {
            if (err) {
                logger.logError('creatorController.editVideo - beginTransaction', err.message);
                return res.redirect('/creator/dashboard');
            }

            Video.update(videoId, creator.id, { title, description, videoUrl, duration, categoryId, status }, (err) => {
                if (err) {
                    return db.rollback(() => {
                        logger.logError('creatorController.editVideo - update', err.message);
                        res.redirect('/creator/dashboard');
                    });
                }

                db.query('DELETE FROM videotag WHERE VideoId = ?', [videoId], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            logger.logError('creatorController.editVideo - delete tags', err.message);
                            res.redirect('/creator/dashboard');
                        });
                    }

                    if (tags.length > 0) {
                        const tagValues = tags.map(tagId => [videoId, tagId]);
                        db.query('INSERT IGNORE INTO videotag (VideoId, TagId) VALUES ?', [tagValues], (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    logger.logError('creatorController.editVideo - insert tags', err.message);
                                    res.redirect('/creator/dashboard');
                                });
                            }
                            db.commit((err) => {
                                if (err) logger.logError('creatorController.editVideo - commit', err.message);
                                res.redirect('/creator/dashboard');
                            });
                        });
                    } else {
                        db.commit((err) => {
                            if (err) logger.logError('creatorController.editVideo - commit', err.message);
                            res.redirect('/creator/dashboard');
                        });
                    }
                });
            });
        });
    });
};

const deleteVideo = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const videoId = req.params.id;
    const userId  = req.session.user.id;

    Creator.findByUserId(userId, (err, creator) => {
        if (err || !creator) return res.redirect('/auth/login');

        Video.delete(videoId, creator.id, (err) => {
            if (err) logger.logError('creatorController.deleteVideo', err.message);
            res.redirect('/creator/dashboard');
        });
    });
};

const showProfile = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    const userId = req.session.user.id;

    db.query('SELECT * FROM user WHERE Id = ?', [userId], (err, userResult) => {
        if (err || userResult.length === 0) return res.redirect('/creator/dashboard');

        Creator.findByUserId(userId, (err, creator) => {
            if (err || !creator) return res.redirect('/creator/dashboard');

            req.session.user.avatar = userResult[0].Avatar;

            res.render('creator/profile', {
                user: req.session.user,
                userData: userResult[0],
                creatorData: creator,
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
        if (err) logger.logError('creatorController.updateCreatorAvatar', err.message);
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
            if (err) logger.logError('creatorController.updateCreatorProfile', err.message);
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

    Creator.updateProfile(userId, { channelName, bio }, (err) => {
        if (err) logger.logError('creatorController.updateChannel', err.message);
        res.redirect('/creator/profile');
    });
};

module.exports = {
    dashboard, showUpload, uploadVideo,
    showEdit, editVideo, deleteVideo,
    showProfile, updateCreatorAvatar, updateCreatorProfile, updateChannel
};
