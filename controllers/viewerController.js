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

module.exports = { home };