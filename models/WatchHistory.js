const db = require('../config/db');

/**
 * Domain Class: WatchHistory
 * Tracks which videos a user has watched and their completion.
 */
class WatchHistory {
    constructor(data) {
        this.id               = data.Id;
        this.userId           = data.UserId;
        this.videoId          = data.VideoId;
        this.watchedAt        = data.WatchedAt;
        this.watchDuration    = data.WatchDuration || 0;
        this.completionPercent = data.CompletionPercent || 0;
        // Joined fields (optional)
        this.title            = data.Title       || null;
        this.videoUrl         = data.VideoUrl    || null;
        this.channelName      = data.ChannelName || null;
        this.duration         = data.Duration    || 0;
        this.category         = data.Category    || null;
        this.creatorAvatar    = data.Avatar      || null;
        this.creatorId        = data.CreatorId   || null;
        this.uploadDate       = data.UploadDate  || null;
    }

    // ── Instance Methods ──────────────────────────────────────

    isCompleted()  { return this.completionPercent >= 90; }
    isStarted()    { return this.completionPercent > 0; }

    getCompletionLabel() {
        if (this.completionPercent >= 90) return 'Completed';
        if (this.completionPercent >= 50) return 'Halfway';
        return 'Started';
    }

    // ── Static DB Methods ─────────────────────────────────────

    /** Get a user's full watch history with video details. Callback: (err, WatchHistory[]) */
    static findByUser(userId, callback) {
        const sql = `
            SELECT wh.*, v.Title, v.VideoUrl, v.Duration, v.UploadDate,
                   c.ChannelName, c.Id AS CreatorId,
                   u.Avatar, cat.Name AS Category
            FROM watchhistory wh
            JOIN video v      ON wh.VideoId   = v.Id
            JOIN creator c    ON v.CreatorId  = c.Id
            JOIN user u       ON c.UserId     = u.Id
            JOIN category cat ON v.CategoryId = cat.Id
            ORDER BY wh.WatchedAt DESC`;
        db.query(sql, [userId], (err, rows) => {
            if (err) return callback(err, []);
            callback(null, rows.map(r => new WatchHistory(r)));
        });
    }

    /** Record a new watch history entry. */
    static add(userId, videoId, completionPercent, watchDuration, callback) {
        const sql = `INSERT INTO watchhistory (UserId, VideoId, CompletionPercent, WatchDuration)
                     VALUES (?, ?, ?, ?)`;
        db.query(sql, [userId, videoId, completionPercent || 0, watchDuration || 0], callback);
    }

    /** Remove a single entry from history. */
    static remove(id, userId, callback) {
        db.query('DELETE FROM watchhistory WHERE Id = ? AND UserId = ?', [id, userId], callback);
    }

    /** Clear all history for a user. */
    static clearAll(userId, callback) {
        db.query('DELETE FROM watchhistory WHERE UserId = ?', [userId], callback);
    }

    /** Count videos watched by user. Callback: (err, count) */
    static countByUser(userId, callback) {
        db.query('SELECT COUNT(*) AS cnt FROM watchhistory WHERE UserId = ?', [userId], (err, rows) => {
            callback(err, rows ? rows[0].cnt : 0);
        });
    }
}

module.exports = WatchHistory;
