const db = require('../config/db');

/**
 * Domain Class: Video
 * Represents an uploaded video and its metadata.
 */
class Video {
    constructor(data) {
        this.id          = data.Id;
        this.creatorId   = data.CreatorId;
        this.categoryId  = data.CategoryId;
        this.title       = data.Title;
        this.description = data.Description || '';
        this.videoUrl    = data.VideoUrl;
        this.thumbnail   = data.Thumbnail || null;
        this.duration    = data.Duration;
        this.views       = data.Views || 0;
        this.status      = data.Status;
        this.uploadDate  = data.UploadDate;
        // Joined fields (optional)
        this.channelName = data.ChannelName || null;
        this.category    = data.Category    || null;
        this.likeCount   = data.LikeCount   || 0;
    }

    // ── Instance Methods ──────────────────────────────────────

    isPublished()  { return this.status === 'Published'; }
    isPrivate()    { return this.status === 'Private'; }
    isUnlisted()   { return this.status === 'Unlisted'; }
    isVisible()    { return this.status === 'Published'; }

    getFormattedDuration() {
        const mins = Math.floor(this.duration / 60);
        const secs = this.duration % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getShortTitle(maxLen = 50) {
        return this.title.length > maxLen ? this.title.substring(0, maxLen) + '…' : this.title;
    }

    // ── Static DB Methods ─────────────────────────────────────

    /** Find a single video by ID. Callback: (err, Video|null) */
    static findById(id, callback) {
        const sql = `
            SELECT v.*, cat.Name AS Category,
                   c.ChannelName,
                   (SELECT COUNT(*) FROM likes WHERE VideoId = v.Id) AS LikeCount
            FROM video v
            JOIN category cat ON v.CategoryId = cat.Id
            JOIN creator c    ON v.CreatorId  = c.Id
            WHERE v.Id = ?`;
        db.query(sql, [id], (err, rows) => {
            if (err) return callback(err, null);
            callback(null, rows.length ? new Video(rows[0]) : null);
        });
    }

    /** Find all published videos (home feed). Callback: (err, Video[]) */
    static findPublished(callback) {
        const sql = `
            SELECT v.*, cat.Name AS Category, c.ChannelName,
                   (SELECT COUNT(*) FROM likes WHERE VideoId = v.Id) AS LikeCount
            FROM video v
            JOIN category cat ON v.CategoryId = cat.Id
            JOIN creator c    ON v.CreatorId  = c.Id
            WHERE v.Status = 'Published'
            ORDER BY v.UploadDate DESC`;
        db.query(sql, (err, rows) => {
            if (err) return callback(err, []);
            callback(null, rows.map(r => new Video(r)));
        });
    }

    /** Find all videos by a specific creator. Callback: (err, Video[]) */
    static findByCreator(creatorId, callback) {
        const sql = `
            SELECT v.*, cat.Name AS Category,
                   (SELECT COUNT(*) FROM likes WHERE VideoId = v.Id) AS LikeCount
            FROM video v
            JOIN category cat ON v.CategoryId = cat.Id
            WHERE v.CreatorId = ?
            ORDER BY v.UploadDate DESC`;
        db.query(sql, [creatorId], (err, rows) => {
            if (err) return callback(err, []);
            callback(null, rows.map(r => new Video(r)));
        });
    }

    /** Increment view count by 1. */
    static incrementViews(id, callback) {
        db.query('UPDATE video SET Views = Views + 1 WHERE Id = ?', [id], callback);
    }

    /** Update video metadata. */
    static update(id, creatorId, { title, description, videoUrl, duration, categoryId, status }, callback) {
        const sql = `UPDATE video
                     SET Title=?, Description=?, VideoUrl=?, Duration=?, CategoryId=?, Status=?
                     WHERE Id=? AND CreatorId=?`;
        db.query(sql, [title, description, videoUrl, duration, categoryId, status, id, creatorId], callback);
    }

    /** Delete a video (cascades to comments, likes, etc.). */
    static delete(id, creatorId, callback) {
        db.query('DELETE FROM video WHERE Id = ? AND CreatorId = ?', [id, creatorId], callback);
    }
}

module.exports = Video;
