const db = require('../config/db');

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
            console.error('DB Error:', err.message);
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

    // Check if already subscribed — toggle
    db.query('SELECT Id FROM subscription WHERE ViewerId = ? AND CreatorId = ?', [userId, creatorId], (err, result) => {
        if (result && result.length > 0) {
            db.query('DELETE FROM subscription WHERE ViewerId = ? AND CreatorId = ?', [userId, creatorId]);
            db.query('UPDATE creator SET TotalSubscribers = TotalSubscribers - 1 WHERE Id = ?', [creatorId]);
        } else {
            db.query('INSERT INTO subscription (ViewerId, CreatorId) VALUES (?, ?)', [userId, creatorId]);
            db.query('UPDATE creator SET TotalSubscribers = TotalSubscribers + 1 WHERE Id = ?', [creatorId]);
        }
        res.redirect('back');
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
            if (err) console.error('Comment error:', err.message);
            res.redirect('/viewer/watch/' + videoId);
        }
    );
};

module.exports = { home, watchVideo, likeVideo, subscribe, addComment };

