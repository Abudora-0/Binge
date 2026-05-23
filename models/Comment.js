const db = require('../config/db');

/**
 * Domain Class: Comment
 * Represents a user comment on a video.
 */
class Comment {
    constructor(data) {
        this.id              = data.Id;
        this.videoId         = data.VideoId;
        this.userId          = data.UserId;
        this.content         = data.Content;
        this.likeCount       = data.LikeCount || 0;
        this.commentDate     = data.CommentDate;
        this.parentCommentId = data.ParentCommentId || null;
        // Joined fields (optional)
        this.firstName   = data.FirstName || null;
        this.lastName    = data.LastName  || null;
        this.avatar      = data.Avatar    || null;
    }

    // ── Instance Methods ──────────────────────────────────────

    isEmpty()      { return !this.content || this.content.trim().length === 0; }
    isReply()      { return this.parentCommentId !== null; }
    getAuthor()    { return `${this.firstName} ${this.lastName}`; }
    getInitial()   { return this.firstName ? this.firstName.charAt(0).toUpperCase() : '?'; }

    getTimeAgo() {
        const diff = Date.now() - new Date(this.commentDate).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1)    return 'just now';
        if (mins < 60)   return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24)    return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }

    // ── Static DB Methods ─────────────────────────────────────

    /** Find all comments for a video, joined with user info. Callback: (err, Comment[]) */
    static findByVideo(videoId, callback) {
        const sql = `
            SELECT cm.*, u.FirstName, u.LastName, u.Avatar
            FROM comment cm
            JOIN user u ON cm.UserId = u.Id
            WHERE cm.VideoId = ?
            ORDER BY cm.CommentDate DESC`;
        db.query(sql, [videoId], (err, rows) => {
            if (err) return callback(err, []);
            callback(null, rows.map(r => new Comment(r)));
        });
    }

    /** Post a new comment. Callback: (err) */
    static create(videoId, userId, content, callback) {
        db.query('INSERT INTO comment (VideoId, UserId, Content) VALUES (?, ?, ?)',
            [videoId, userId, content], callback);
    }

    /** Delete a comment by ID and owning user. */
    static delete(id, userId, callback) {
        db.query('DELETE FROM comment WHERE Id = ? AND UserId = ?', [id, userId], callback);
    }

    /** Count total comments for a video. Callback: (err, count) */
    static countByVideo(videoId, callback) {
        db.query('SELECT COUNT(*) AS cnt FROM comment WHERE VideoId = ?', [videoId], (err, rows) => {
            callback(err, rows ? rows[0].cnt : 0);
        });
    }
}

module.exports = Comment;
