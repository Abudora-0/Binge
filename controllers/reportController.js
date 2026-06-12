const db = require('../config/db');
const PDFDocument = require('pdfkit');

// ── Helper: Analysis Summary Box ───────────────────────────
function drawAnalysis(doc, points, startY) {
    const boxX = 40, boxW = doc.page.width - 80;
    const lineH = 18;
    const boxH  = 14 + points.length * lineH;

    doc.fillColor('#fff5f5').rect(boxX, startY, boxW, boxH).fill();
    doc.strokeColor('#CC0000').lineWidth(1).rect(boxX, startY, boxW, boxH).stroke();

    doc.fillColor('#CC0000').fontSize(9).font('Helvetica-Bold')
       .text('Analysis Summary', boxX + 10, startY + 6);

    points.forEach((pt, i) => {
        doc.fillColor('#333').fontSize(8).font('Helvetica')
           .text(`• ${pt}`, boxX + 10, startY + 14 + i * lineH + 6, { width: boxW - 20 });
    });

    return startY + boxH + 12;
}

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

// Report 1: Trending Videos — powered by vw_TrendingVideos
const trendingVideos = (req, res) => {
    const { from, to } = req.query;

    let query = `SELECT * FROM vw_TrendingVideos WHERE 1=1`;
    const params = [];
    if (from) { query += ` AND UploadDate >= ?`; params.push(from); }
    if (to)   { query += ` AND UploadDate <= ?`; params.push(to); }
    query += ` ORDER BY Views DESC LIMIT 20`;

    db.query(query, params, (err, rows) => {
        if (err) return res.status(500).send('Report error');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="trending_videos.pdf"');
        doc.pipe(res);
        let y = pageHeader(doc, 'Top Trending Videos', `Generated on ${new Date().toLocaleDateString()}`);

        if (rows.length > 0) {
            const totalViews   = rows.reduce((s, r) => s + r.Views, 0);
            const avgViews     = Math.round(totalViews / rows.length);
            const top          = rows[0];
            const totalLikes   = rows.reduce((s, r) => s + r.TotalLikes, 0);
            const mostCommented = rows.reduce((a, b) => b.TotalComments > a.TotalComments ? b : a);
            const categories   = [...new Set(rows.map(r => r.Category))];
            y = drawAnalysis(doc, [
                `Total videos in report: ${rows.length} | Combined views: ${totalViews.toLocaleString()} | Average views per video: ${avgViews.toLocaleString()}`,
                `Top video: "${top.Title}" by ${top.ChannelName} with ${top.Views.toLocaleString()} views`,
                `Total likes across all listed videos: ${totalLikes.toLocaleString()}`,
                `Most commented video: "${mostCommented.Title}" with ${mostCommented.TotalComments} comments`,
                `Categories represented: ${categories.join(', ')}`
            ], y);
        }

        const headers = ['Title', 'Channel', 'Category', 'Views', 'Likes', 'Comments', 'Uploaded'];
        const data = rows.map(r => [
            r.Title.substring(0, 22), r.ChannelName, r.Category,
            r.Views, r.TotalLikes, r.TotalComments,
            new Date(r.UploadDate).toLocaleDateString()
        ]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

// Report 2: Top Creators — powered by vw_CreatorStats
const topCreators = (req, res) => {
    const { country } = req.query;

    let query = `SELECT * FROM vw_CreatorStats WHERE 1=1`;
    const params = [];
    if (country) { query += ` AND Country = ?`; params.push(country); }
    query += ` ORDER BY ActiveSubscribers DESC`;

    db.query(query, params, (err, rows) => {
        if (err) return res.status(500).send('Report error');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="top_creators.pdf"');
        doc.pipe(res);
        let y = pageHeader(doc, 'Creator Stats Report', `Generated on ${new Date().toLocaleDateString()}`);

        if (rows.length > 0) {
            const totalSubs    = rows.reduce((s, r) => s + r.ActiveSubscribers, 0);
            const totalRevenue = rows.reduce((s, r) => s + parseFloat(r.TotalRevenue), 0);
            const totalViews   = rows.reduce((s, r) => s + r.RealTotalViews, 0);
            const top          = rows[0];
            const topRevenue   = rows.reduce((a, b) => parseFloat(b.TotalRevenue) > parseFloat(a.TotalRevenue) ? b : a);
            const avgVideos    = Math.round(rows.reduce((s, r) => s + r.PublishedVideos, 0) / rows.length);
            y = drawAnalysis(doc, [
                `Total creators: ${rows.length} | Total subscribers across platform: ${totalSubs.toLocaleString()} | Total views: ${totalViews.toLocaleString()}`,
                `Most subscribed creator: ${top.ChannelName} with ${top.ActiveSubscribers.toLocaleString()} subscribers`,
                `Highest earning creator: ${topRevenue.ChannelName} with $${parseFloat(topRevenue.TotalRevenue).toFixed(2)} total revenue`,
                `Platform total estimated revenue: $${totalRevenue.toFixed(2)}`,
                `Average published videos per creator: ${avgVideos}`
            ], y);
        }

        const headers = ['Channel', 'Subscribers', 'Videos', 'Real Views', 'Revenue ($)', 'Country'];
        const data = rows.map(r => [
            r.ChannelName, r.ActiveSubscribers, r.PublishedVideos,
            r.RealTotalViews, parseFloat(r.TotalRevenue).toFixed(2), r.Country
        ]);
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

        let y = pageHeader(doc, 'Category Engagement Report', `Generated on ${new Date().toLocaleDateString()}`);

        if (rows.length > 0) {
            const top         = rows[0];
            const totalVideos = rows.reduce((s, r) => s + r.TotalVideos, 0);
            const totalViews  = rows.reduce((s, r) => s + (r.TotalViews || 0), 0);
            const topLikes    = rows.reduce((a, b) => b.TotalLikes > a.TotalLikes ? b : a);
            const noContent   = rows.filter(r => r.TotalVideos === 0).map(r => r.Name);
            y = drawAnalysis(doc, [
                `Total categories: ${rows.length} | Total videos across all categories: ${totalVideos} | Total platform views: ${totalViews.toLocaleString()}`,
                `Most viewed category: ${top.Name} with ${(top.TotalViews || 0).toLocaleString()} views`,
                `Most liked category: ${topLikes.Name} with ${topLikes.TotalLikes} likes`,
                noContent.length > 0
                    ? `Categories with no content yet: ${noContent.join(', ')}`
                    : `All categories have at least one video uploaded`
            ], y);
        }

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

        let y = pageHeader(doc, 'Video Engagement Score Report', `Generated on ${new Date().toLocaleDateString()}`);

        if (rows.length > 0) {
            const top        = rows[0];
            const avgScore   = Math.round(rows.reduce((s, r) => s + r.EngagementScore, 0) / rows.length);
            const avgCompletion = (rows.reduce((s, r) => s + parseFloat(r.AvgCompletion || 0), 0) / rows.length).toFixed(1);
            const highComp   = rows.reduce((a, b) => parseFloat(b.AvgCompletion) > parseFloat(a.AvgCompletion) ? b : a);
            const zeroEngage = rows.filter(r => r.Likes === 0 && r.Comments === 0).length;
            y = drawAnalysis(doc, [
                `Total videos analysed: ${rows.length} | Average engagement score: ${avgScore} | Average watch completion: ${avgCompletion}%`,
                `Highest engagement: "${top.Title}" by ${top.ChannelName} — Score: ${Math.round(top.EngagementScore)}`,
                `Score formula: Views × 0.5 + Likes × 2 + Comments × 3 (comments weighted highest as active engagement)`,
                `Best watch completion: "${highComp.Title}" at ${highComp.AvgCompletion}%`,
                `Videos with zero likes and zero comments (no engagement): ${zeroEngage}`
            ], y);
        }

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

        let y = pageHeader(doc, 'Monthly Watch Summary', `Generated on ${new Date().toLocaleDateString()}`);

        if (rows.length > 0) {
            const totalWatches  = rows.reduce((s, r) => s + r.TotalWatches, 0);
            const peakMonth     = rows.reduce((a, b) => b.TotalWatches > a.TotalWatches ? b : a);
            const avgCompletion = (rows.reduce((s, r) => s + parseFloat(r.AvgCompletion), 0) / rows.length).toFixed(1);
            const months        = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const trend         = rows.length >= 2
                ? (rows[0].TotalWatches >= rows[1].TotalWatches ? 'increasing' : 'decreasing')
                : 'insufficient data';
            y = drawAnalysis(doc, [
                `Total months tracked: ${rows.length} | Total watch events recorded: ${totalWatches.toLocaleString()}`,
                `Peak month: ${months[peakMonth.Month]} ${peakMonth.Year} with ${peakMonth.TotalWatches} watch events and ${peakMonth.UniqueViewers} unique viewers`,
                `Platform average watch completion across all months: ${avgCompletion}%`,
                `Recent trend: watch activity is ${trend} compared to previous month`
            ], y);
        }

        const headers = ['Month', 'Year', 'Total Watches', 'Unique Viewers', 'Unique Videos', 'Avg Completion%'];
        const data = rows.map(r => [r.Month, r.Year, r.TotalWatches, r.UniqueViewers, r.UniqueVideos, r.AvgCompletion]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

// Report 6: All Users — powered by vw_UserActivity
const allUsers = (req, res) => {
    const { status, country } = req.query;

    let query = `SELECT * FROM vw_UserActivity WHERE 1=1`;
    const params = [];
    if (status)  { query += ` AND Status = ?`;  params.push(status); }
    if (country) { query += ` AND Country = ?`; params.push(country); }
    query += ` ORDER BY LastActive DESC`;

    db.query(query, params, (err, rows) => {
        if (err) return res.status(500).send('Report error');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="all_users.pdf"');
        doc.pipe(res);
        let y = pageHeader(doc, 'User Activity Report', `Generated on ${new Date().toLocaleDateString()}`);

        if (rows.length > 0) {
            const active      = rows.filter(r => r.Status === 'Active').length;
            const suspended   = rows.filter(r => r.Status === 'Suspended').length;
            const mostActive  = rows.reduce((a, b) => b.VideosWatched > a.VideosWatched ? b : a);
            const neverActive = rows.filter(r => !r.LastActive).length;
            const avgWatched  = (rows.reduce((s, r) => s + r.VideosWatched, 0) / rows.length).toFixed(1);
            y = drawAnalysis(doc, [
                `Total users: ${rows.length} | Active: ${active} | Suspended: ${suspended}`,
                `Most active user: ${mostActive.FirstName} ${mostActive.LastName} — watched ${mostActive.VideosWatched} videos, made ${mostActive.CommentsMade} comments`,
                `Average videos watched per user: ${avgWatched}`,
                `Users who have never watched anything: ${neverActive}`,
            ], y);
        }

        const headers = ['Name', 'Country', 'Status', 'Watched', 'Comments', 'Subs', 'Last Active'];
        const data = rows.map(r => [
            `${r.FirstName} ${r.LastName}`, r.Country, r.Status,
            r.VideosWatched, r.CommentsMade, r.Subscriptions,
            r.LastActive ? new Date(r.LastActive).toLocaleDateString() : 'Never'
        ]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};


// Report 7: All Videos with filters
const allVideos = (req, res) => {
    const { status, categoryId } = req.query;

    let query = `
        SELECT v.Title, c.ChannelName, cat.Name AS Category,
               v.Views, v.Status, v.UploadDate
        FROM video v
        JOIN creator c    ON v.CreatorId  = c.Id
        JOIN category cat ON v.CategoryId = cat.Id
        WHERE 1=1
    `;
    const params = [];
    if (status)     { query += ` AND v.Status = ?`;     params.push(status); }
    if (categoryId) { query += ` AND v.CategoryId = ?`; params.push(categoryId); }
    query += ` ORDER BY v.UploadDate DESC`;

    db.query(query, params, (err, rows) => {
        if (err) return res.status(500).send('Report error');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="all_videos.pdf"');
        doc.pipe(res);
        let y = pageHeader(doc, 'All Videos Report', `Generated on ${new Date().toLocaleDateString()}`);

        if (rows.length > 0) {
            const published = rows.filter(r => r.Status === 'Published').length;
            const private_  = rows.filter(r => r.Status === 'Private').length;
            const removed   = rows.filter(r => r.Status === 'Removed').length;
            const totalViews = rows.reduce((s, r) => s + r.Views, 0);
            const topVideo  = rows.reduce((a, b) => b.Views > a.Views ? b : a);
            y = drawAnalysis(doc, [
                `Total videos: ${rows.length} | Published: ${published} | Private: ${private_} | Removed: ${removed}`,
                `Combined total views: ${totalViews.toLocaleString()}`,
                `Most viewed video: "${topVideo.Title}" by ${topVideo.ChannelName} with ${topVideo.Views.toLocaleString()} views`,
            ], y);
        }

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

        let y = pageHeader(doc, 'Comment Activity Report', `Generated on ${new Date().toLocaleDateString()}`);

        if (rows.length > 0) {
            const totalComments = rows.reduce((s, r) => s + r.TotalComments, 0);
            const top           = rows[0];
            const noComments    = rows.filter(r => r.TotalComments === 0).length;
            const withComments  = rows.length - noComments;
            y = drawAnalysis(doc, [
                `Total videos: ${rows.length} | Total comments on platform: ${totalComments} | Videos with at least one comment: ${withComments}`,
                `Most discussed video: "${top.Title}" with ${top.TotalComments} comments`,
                `Videos with no comments (zero engagement): ${noComments} out of ${rows.length}`
            ], y);
        }

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

        let y = pageHeader(doc, 'Subscription Report', `Generated on ${new Date().toLocaleDateString()}`);

        if (rows.length > 0) {
            const totalSubs  = rows.reduce((s, r) => s + r.ActiveSubscriptions, 0);
            const top        = rows[0];
            const noSubs     = rows.filter(r => r.ActiveSubscriptions === 0).length;
            const avgSubs    = Math.round(totalSubs / rows.length);
            y = drawAnalysis(doc, [
                `Total creators: ${rows.length} | Total active subscriptions on platform: ${totalSubs.toLocaleString()} | Average per creator: ${avgSubs}`,
                `Most subscribed channel: ${top.ChannelName} with ${top.ActiveSubscriptions.toLocaleString()} active subscriptions`,
                `Creators with no active subscriptions: ${noSubs}`
            ], y);
        }

        const headers = ['Channel', 'Total Subscribers', 'Active Subscriptions', 'Last Subscribed'];
        const data = rows.map(r => [
            r.ChannelName, r.TotalSubscribers, r.ActiveSubscriptions,
            r.LastSubscribed ? new Date(r.LastSubscribed).toLocaleDateString() : 'None'
        ]);
        drawTable(doc, headers, data, y);
        doc.end();
    });
};

// Report 10: Moderation with status filter
const moderationReport = (req, res) => {
    const { status } = req.query;

    let query = `
        SELECT r.Reason, r.Status, r.ReportedAt,
               v.Title AS VideoTitle,
               u.FirstName, u.LastName
        FROM report r
        JOIN video v ON r.VideoId    = v.Id
        JOIN user u  ON r.ReportedBy = u.Id
        WHERE 1=1
    `;
    const params = [];
    if (status) { query += ` AND r.Status = ?`; params.push(status); }
    query += ` ORDER BY r.ReportedAt DESC`;

    db.query(query, params, (err, rows) => {
        if (err) return res.status(500).send('Report error');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="moderation_report.pdf"');
        doc.pipe(res);
        let y = pageHeader(doc, 'Content Moderation Report', `Generated on ${new Date().toLocaleDateString()}`);

        if (rows.length > 0) {
            const pending     = rows.filter(r => r.Status === 'Pending').length;
            const reviewed    = rows.filter(r => r.Status === 'Reviewed').length;
            const dismissed   = rows.filter(r => r.Status === 'Dismissed').length;
            const actionTaken = rows.filter(r => r.Status === 'ActionTaken').length;
            const resolvedPct = rows.length > 0
                ? Math.round(((reviewed + dismissed + actionTaken) / rows.length) * 100)
                : 0;
            y = drawAnalysis(doc, [
                `Total reports: ${rows.length} | Pending: ${pending} | Reviewed: ${reviewed} | Dismissed: ${dismissed} | Action Taken: ${actionTaken}`,
                `Resolution rate: ${resolvedPct}% of reports have been acted upon`,
                pending > 0
                    ? `${pending} report(s) still pending review — admin action required`
                    : `All reports have been reviewed — no pending moderation items`
            ], y);
        }

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