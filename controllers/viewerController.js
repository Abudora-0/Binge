const db = require('../config/db');
const logger = require('../config/logger');

const home = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const query = `
        SELECT v.Id, v.Title, v.Views, v.UploadDate, v.Duration,
               c.ChannelName, cat.Name AS Category
        FROM video v
        JOIN creator c    ON v.CreatorId  = c.Id
        JOIN category cat ON v.CategoryId = cat.Id
        WHERE v.Status = 'Published'
        ORDER BY v.UploadDate DESC
    `;

    db.query(query, (err, videos) => {
        if (err) {
            logger.logError('viewerController', err.message);
            return res.render('viewer/home', { user: req.session.user, videos: [] });
        }
        res.render('viewer/home', { user: req.session.user, videos });
    });
};

const watchVideo = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const videoId = req.params.id;
    const userId  = req.session.user.id;

    // Get video details
    const videoQuery = `
        SELECT v.*, cat.Name AS Category,
               c.ChannelName, c.TotalSubscribers, c.Id AS CreatorId,
               (SELECT COUNT(*) FROM likes WHERE VideoId = v.Id) AS LikeCount
        FROM video v
        JOIN creator c    ON v.CreatorId  = c.Id
        JOIN category cat ON v.CategoryId = cat.Id
        WHERE v.Id = ?
    `;

    db.query(videoQuery, [videoId], (err, videoResult) => {
        if (err || videoResult.length === 0) return res.redirect('/viewer/home');

        const video = videoResult[0];

        // Increment view count
        db.query('UPDATE video SET Views = Views + 1 WHERE Id = ?', [videoId]);

        // Convert YouTube URL to embed URL
        let embedUrl = video.VideoUrl;
        if (embedUrl.includes('youtube.com/watch?v=')) {
            const videoCode = embedUrl.split('v=')[1].split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${videoCode}`;
        } else if (embedUrl.includes('youtu.be/')) {
            const videoCode = embedUrl.split('youtu.be/')[1];
            embedUrl = `https://www.youtube.com/embed/${videoCode}`;
        }

        // Check if liked
        db.query('SELECT Id FROM likes WHERE VideoId = ? AND UserId = ?', [videoId, userId], (err, likeResult) => {
            const liked = likeResult && likeResult.length > 0;

            // Check if subscribed
            db.query('SELECT Id FROM subscription WHERE ViewerId = ? AND CreatorId = ?',
                [userId, video.CreatorId], (err, subResult) => {
                const subscribed = subResult && subResult.length > 0;

                // Get comments
                const commentQuery = `
                    SELECT cm.*, u.FirstName, u.LastName
                    FROM comment cm
                    JOIN user u ON cm.UserId = u.Id
                    WHERE cm.VideoId = ?
                    ORDER BY cm.CommentDate DESC
                `;

                db.query(commentQuery, [videoId], (err, comments) => {
                    if (err) comments = [];

                    // Get related videos
                    const relatedQuery = `
                        SELECT v.Id, v.Title, v.Views, c.ChannelName
                        FROM video v
                        JOIN creator c ON v.CreatorId = c.Id
                        WHERE v.CategoryId = ? AND v.Id != ? AND v.Status = 'Published'
                        LIMIT 6
                    `;

                    db.query(relatedQuery, [video.CategoryId, videoId], (err, related) => {
                        if (err) related = [];

                        // Log watch history
                        db.query(
                            'INSERT INTO watchhistory (UserId, VideoId, WatchDuration, CompletionPercent) VALUES (?, ?, 0, 0)',
                            [userId, videoId]
                        );

                        res.render('viewer/watch', {
                            user: req.session.user,
                            video,
                            embedUrl,
                            liked,
                            subscribed,
                            comments,
                            related
                        });
                    });
                });
            });
        });
    });
};

const likeVideo = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const videoId = req.params.id;
    const userId  = req.session.user.id;

    // Check if already liked — toggle
    db.query('SELECT Id FROM likes WHERE VideoId = ? AND UserId = ?', [videoId, userId], (err, result) => {
        if (result && result.length > 0) {
            db.query('DELETE FROM likes WHERE VideoId = ? AND UserId = ?', [videoId, userId]);
        } else {
            db.query('INSERT INTO likes (VideoId, UserId) VALUES (?, ?)', [videoId, userId]);
        }
        res.redirect('/viewer/watch/' + videoId);
    });
};

const subscribe = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const creatorId = req.params.id;
    const userId    = req.session.user.id;

    // Use transaction — subscribe + update count must both succeed or both fail
    db.beginTransaction((err) => {
        if (err) {
            logger.logError('subscribe - beginTransaction', err.message);
            return res.redirect('back');
        }

        db.query('SELECT Id FROM subscription WHERE ViewerId = ? AND CreatorId = ?',
            [userId, creatorId], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    logger.logError('subscribe - check', err.message);
                    res.redirect('back');
                });
            }

            if (result.length > 0) {
                // Unsubscribe
                db.query('DELETE FROM subscription WHERE ViewerId = ? AND CreatorId = ?',
                    [userId, creatorId], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            logger.logError('subscribe - delete', err.message);
                            res.redirect('back');
                        });
                    }

                    db.query('UPDATE creator SET TotalSubscribers = TotalSubscribers - 1 WHERE Id = ?',
                        [creatorId], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                logger.logError('subscribe - update count', err.message);
                                res.redirect('back');
                            });
                        }

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    logger.logError('subscribe - commit', err.message);
                                    res.redirect('back');
                                });
                            }
                            res.redirect('back');
                        });
                    });
                });

            } else {
                // Subscribe
                db.query('INSERT INTO subscription (ViewerId, CreatorId) VALUES (?, ?)',
                    [userId, creatorId], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            logger.logError('subscribe - insert', err.message);
                            res.redirect('back');
                        });
                    }

                    db.query('UPDATE creator SET TotalSubscribers = TotalSubscribers + 1 WHERE Id = ?',
                        [creatorId], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                logger.logError('subscribe - update count', err.message);
                                res.redirect('back');
                            });
                        }

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    logger.logError('subscribe - commit', err.message);
                                    res.redirect('back');
                                });
                            }
                            res.redirect('back');
                        });
                    });
                });
            }
        });
    });
};

const addComment = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const videoId = req.params.id;
    const userId  = req.session.user.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
        return res.redirect('/viewer/watch/' + videoId);
    }

    db.query(
        'INSERT INTO comment (VideoId, UserId, Content) VALUES (?, ?, ?)',
        [videoId, userId, content.trim()],
        (err) => {
            if (err) logger.logError('viewerController', err.message);
            res.redirect('/viewer/watch/' + videoId);
        }
    );
};

const subscriptions = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const userId = req.session.user.id;

    const query = `
        SELECT c.Id, c.ChannelName, c.TotalSubscribers, c.TotalViews,
               COUNT(DISTINCT v.Id) AS TotalVideos,
               s.SubscribedAt
        FROM subscription s
        JOIN creator c ON s.CreatorId = c.Id
        LEFT JOIN video v ON v.CreatorId = c.Id AND v.Status = 'Published'
        WHERE s.ViewerId = ?
        GROUP BY c.Id, c.ChannelName, c.TotalSubscribers, c.TotalViews, s.SubscribedAt
        ORDER BY s.SubscribedAt DESC
    `;

    db.query(query, [userId], (err, creators) => {
        if (err) {
            logger.logError('subscriptions', err.message);
            creators = [];
        }
        res.render('viewer/subscriptions', { user: req.session.user, creators });
    });
};

const history = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const userId = req.session.user.id;

    const query = `
        SELECT wh.WatchedAt, wh.CompletionPercent,
               v.Id AS VideoId, v.Title, v.Duration, v.Views,
               c.ChannelName, cat.Name AS Category
        FROM watchhistory wh
        JOIN video v      ON wh.VideoId    = v.Id
        JOIN creator c    ON v.CreatorId   = c.Id
        JOIN category cat ON v.CategoryId  = cat.Id
        WHERE wh.UserId = ?
        ORDER BY wh.WatchedAt DESC
        LIMIT 50
    `;

    db.query(query, [userId], (err, history) => {
        if (err) {
            logger.logError('history', err.message);
            history = [];
        }
        res.render('viewer/history', { user: req.session.user, history });
    });
};

const playlists = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const userId = req.session.user.id;

    const query = `
        SELECT p.*, COUNT(pi.Id) AS TotalVideos
        FROM playlist p
        LEFT JOIN playlistitem pi ON pi.PlaylistId = p.Id
        WHERE p.UserId = ?
        GROUP BY p.Id
        ORDER BY p.CreatedAt DESC
    `;

    db.query(query, [userId], (err, playlists) => {
        if (err) {
            logger.logError('playlists', err.message);
            playlists = [];
        }
        res.render('viewer/playlists', { user: req.session.user, playlists });
    });
};

const createPlaylist = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const { title, description, visibility } = req.body;
    const userId = req.session.user.id;

    if (!title || title.trim().length === 0) return res.redirect('/viewer/playlists');

    db.query(
        'INSERT INTO playlist (UserId, Title, Description, Visibility) VALUES (?, ?, ?, ?)',
        [userId, title.trim(), description, visibility || 'Public'],
        (err) => {
            if (err) logger.logError('createPlaylist', err.message);
            res.redirect('/viewer/playlists');
        }
    );
};

module.exports = { home, watchVideo, likeVideo, subscribe, addComment, subscriptions, history, playlists, createPlaylist };



