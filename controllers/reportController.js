const db = require('../config/db');
const PDFDocument = require('pdfkit');

// ── Helper: Draw Table ──────────────────────────────────────
function drawTable(doc, headers, rows, startY) {
    const colWidth  = (doc.page.width - 80) / headers.length;
    const rowHeight = 25;
    let y = startY;

    // Header row
    doc.fillColor('#CC0000').rect(40, y, doc.page.width - 80, rowHeight).fill();
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
    headers.forEach((h, i) => {
        doc.text(h, 40 + i * colWidth + 5, y + 7, { width: colWidth - 10 });
    });
    y += rowHeight;

    // Data rows
    rows.forEach((row, ri) => {
        const fill = ri % 2 === 0 ? '#f9f9f9' : 'white';
        doc.fillColor(fill).rect(40, y, doc.page.width - 80, rowHeight).fill();
        doc.fillColor('#333333').fontSize(8).font('Helvetica');
        row.forEach((cell, i) => {
            doc.text(String(cell ?? '—'), 40 + i * colWidth + 5, y + 7, { width: colWidth - 10 });
        });
        y += rowHeight;

        // New page if needed
        if (y > doc.page.height - 80) {
            doc.addPage();
            y = 50;
        }
    });

    return y;
}

// ── Helper: Page Header ─────────────────────────────────────
function pageHeader(doc, title, subtitle = '') {
    doc.fillColor('#CC0000').fontSize(22).font('Helvetica-Bold').text('Binge', 40, 40);
    doc.fillColor('#333').fontSize(14).font('Helvetica-Bold').text(title, 40, 68);
    if (subtitle) {
        doc.fillColor('#888').fontSize(9).font('Helvetica').text(subtitle, 40, 86);
    }
    doc.moveTo(40, 105).lineTo(doc.page.width - 40, 105).strokeColor('#CC0000').lineWidth(1.5).stroke();
    return 120;
}

// ── Report 1: Top Trending Videos ──────────────────────────
const trendingVideos = (req, res) => {
    const query = `SELECT * FROM vw_TrendingVideos LIMIT 20`;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).send('Report error');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="trending_videos.pdf"');
        doc.pipe(res);

        const y = pageHeader(doc, 'Top Trending Videos', `Generated on ${new Date().toLocaleDateString()}`);
        const headers = ['Title', 'Channel', 'Category', 'Views', 'Likes', 'Comments'];
        const data = rows.map(r => [r.Title, r.ChannelName, r.Category, r.Views, r.TotalLikes, r.TotalComments]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

// ── Report 2: Most Subscribed Creators ─────────────────────
const topCreators = (req, res) => {
    const query = `
        SELECT c.ChannelName, c.TotalSubscribers, c.TotalViews,
               COUNT(DISTINCT v.Id) AS TotalVideos,
               u.Country
        FROM creator c
        JOIN user u ON c.UserId = u.Id
        LEFT JOIN video v ON v.CreatorId = c.Id
        GROUP BY c.Id, c.ChannelName, c.TotalSubscribers, c.TotalViews, u.Country
        ORDER BY c.TotalSubscribers DESC
    `;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).send('Report error');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="top_creators.pdf"');
        doc.pipe(res);

        const y = pageHeader(doc, 'Most Subscribed Creators', `Generated on ${new Date().toLocaleDateString()}`);
        const headers = ['Channel', 'Subscribers', 'Total Views', 'Videos', 'Country'];
        const data = rows.map(r => [r.ChannelName, r.TotalSubscribers, r.TotalViews, r.TotalVideos, r.Country]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

// ── Report 3: Category Engagement ──────────────────────────
const categoryEngagement = (req, res) => {
    const query = `SELECT * FROM vw_TopCategories`;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).send('Report error');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="category_engagement.pdf"');
        doc.pipe(res);

        const y = pageHeader(doc, 'Category Engagement Report', `Generated on ${new Date().toLocaleDateString()}`);
        const headers = ['Category', 'Total Videos', 'Total Views', 'Total Likes'];
        const data = rows.map(r => [r.Name, r.TotalVideos, r.TotalViews ?? 0, r.TotalLikes]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

// ── Report 4: Video Engagement Score ───────────────────────
const videoEngagement = (req, res) => {
    const query = `SELECT * FROM vw_VideoEngagement ORDER BY EngagementScore DESC`;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).send('Report error');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="video_engagement.pdf"');
        doc.pipe(res);

        const y = pageHeader(doc, 'Video Engagement Score Report', `Generated on ${new Date().toLocaleDateString()}`);
        const headers = ['Title', 'Channel', 'Views', 'Likes', 'Comments', 'Avg Completion%', 'Score'];
        const data = rows.map(r => [
            r.Title.substring(0, 25), r.ChannelName,
            r.Views, r.Likes, r.Comments,
            r.AvgCompletion ?? 0, Math.round(r.EngagementScore)
        ]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

// ── Report 5: Monthly Watch Summary ────────────────────────
const monthlyWatch = (req, res) => {
    const query = `SELECT * FROM vw_MonthlyWatchSummary`;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).send('Report error');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="monthly_watch.pdf"');
        doc.pipe(res);

        const y = pageHeader(doc, 'Monthly Watch Summary', `Generated on ${new Date().toLocaleDateString()}`);
        const headers = ['Month', 'Year', 'Total Watches', 'Unique Viewers', 'Unique Videos', 'Avg Completion%'];
        const data = rows.map(r => [r.Month, r.Year, r.TotalWatches, r.UniqueViewers, r.UniqueVideos, r.AvgCompletion]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

// ── Report 6: All Users ─────────────────────────────────────
const allUsers = (req, res) => {
    const query = `
        SELECT u.FirstName, u.LastName, u.Email, u.Country,
               u.JoinDate, u.Status,
               CASE WHEN c.Id IS NOT NULL THEN 'Creator' ELSE 'Viewer' END AS Role
        FROM user u
        LEFT JOIN creator c ON c.UserId = u.Id
        ORDER BY u.JoinDate DESC
    `;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).send('Report error');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="all_users.pdf"');
        doc.pipe(res);

        const y = pageHeader(doc, 'All Users Report', `Generated on ${new Date().toLocaleDateString()}`);
        const headers = ['First Name', 'Last Name', 'Email', 'Country', 'Role', 'Status'];
        const data = rows.map(r => [r.FirstName, r.LastName, r.Email, r.Country, r.Role, r.Status]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

// ── Report 7: All Videos ────────────────────────────────────
const allVideos = (req, res) => {
    const query = `
        SELECT v.Title, c.ChannelName, cat.Name AS Category,
               v.Views, v.Status, v.UploadDate, v.Duration
        FROM video v
        JOIN creator c    ON v.CreatorId  = c.Id
        JOIN category cat ON v.CategoryId = cat.Id
        ORDER BY v.UploadDate DESC
    `;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).send('Report error');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="all_videos.pdf"');
        doc.pipe(res);

        const y = pageHeader(doc, 'All Videos Report', `Generated on ${new Date().toLocaleDateString()}`);
        const headers = ['Title', 'Channel', 'Category', 'Views', 'Status', 'Upload Date'];
        const data = rows.map(r => [
            r.Title.substring(0, 22), r.ChannelName,
            r.Category, r.Views, r.Status,
            new Date(r.UploadDate).toLocaleDateString()
        ]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

// ── Report 8: Comment Activity ──────────────────────────────
const commentActivity = (req, res) => {
    const query = `
        SELECT v.Title, COUNT(cm.Id) AS TotalComments,
               MAX(cm.CommentDate) AS LastComment
        FROM video v
        LEFT JOIN comment cm ON cm.VideoId = v.Id
        GROUP BY v.Id, v.Title
        ORDER BY TotalComments DESC
    `;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).send('Report error');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="comment_activity.pdf"');
        doc.pipe(res);

        const y = pageHeader(doc, 'Comment Activity Report', `Generated on ${new Date().toLocaleDateString()}`);
        const headers = ['Video Title', 'Total Comments', 'Last Comment Date'];
        const data = rows.map(r => [
            r.Title.substring(0, 35),
            r.TotalComments,
            r.LastComment ? new Date(r.LastComment).toLocaleDateString() : 'No comments'
        ]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

// ── Report 9: Subscription Report ──────────────────────────
const subscriptions = (req, res) => {
    const query = `
        SELECT c.ChannelName, c.TotalSubscribers,
               COUNT(s.Id) AS ActiveSubscriptions,
               MAX(s.SubscribedAt) AS LastSubscribed
        FROM creator c
        LEFT JOIN subscription s ON s.CreatorId = c.Id
        GROUP BY c.Id, c.ChannelName, c.TotalSubscribers
        ORDER BY ActiveSubscriptions DESC
    `;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).send('Report error');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="subscriptions.pdf"');
        doc.pipe(res);

        const y = pageHeader(doc, 'Subscription Report', `Generated on ${new Date().toLocaleDateString()}`);
        const headers = ['Channel', 'Total Subscribers', 'Active Subscriptions', 'Last Subscribed'];
        const data = rows.map(r => [
            r.ChannelName, r.TotalSubscribers, r.ActiveSubscriptions,
            r.LastSubscribed ? new Date(r.LastSubscribed).toLocaleDateString() : 'None'
        ]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

// ── Report 10: Content Moderation Report ───────────────────
const moderationReport = (req, res) => {
    const query = `
        SELECT r.Reason, r.Status, r.ReportedAt,
               v.Title AS VideoTitle,
               u.FirstName, u.LastName
        FROM report r
        JOIN video v ON r.VideoId    = v.Id
        JOIN user u  ON r.ReportedBy = u.Id
        ORDER BY r.ReportedAt DESC
    `;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).send('Report error');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="moderation_report.pdf"');
        doc.pipe(res);

        const y = pageHeader(doc, 'Content Moderation Report', `Generated on ${new Date().toLocaleDateString()}`);
        const headers = ['Video', 'Reported By', 'Reason', 'Status', 'Date'];
        const data = rows.map(r => [
            r.VideoTitle.substring(0, 20),
            `${r.FirstName} ${r.LastName}`,
            r.Reason.substring(0, 20),
            r.Status,
            new Date(r.ReportedAt).toLocaleDateString()
        ]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

module.exports = {
    trendingVideos, topCreators, categoryEngagement,
    videoEngagement, monthlyWatch, allUsers, allVideos,
    commentActivity, subscriptions, moderationReport
};