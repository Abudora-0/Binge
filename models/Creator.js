const db = require('../config/db');

/**
 * Domain Class: Creator
 * Represents a content creator with a channel on the platform.
 */
class Creator {
    constructor(data) {
        this.id               = data.Id;
        this.userId           = data.UserId;
        this.channelName      = data.ChannelName;
        this.bio              = data.Bio || null;
        this.totalSubscribers = data.TotalSubscribers || 0;
        this.totalViews       = data.TotalViews || 0;
        this.createdAt        = data.CreatedAt;
    }

    // ── Instance Methods ──────────────────────────────────────

    hasBio()      { return this.bio !== null && this.bio.trim().length > 0; }
    isPopular()   { return this.totalSubscribers >= 1000; }
    isViral()     { return this.totalViews >= 100000; }

    getSubscriberLabel() {
        if (this.totalSubscribers >= 1000000) return `${(this.totalSubscribers / 1000000).toFixed(1)}M`;
        if (this.totalSubscribers >= 1000)    return `${(this.totalSubscribers / 1000).toFixed(1)}K`;
        return String(this.totalSubscribers);
    }

    // ── Static DB Methods ─────────────────────────────────────

    /** Find creator by their own primary key. Callback: (err, Creator|null) */
    static findById(id, callback) {
        db.query('SELECT * FROM creator WHERE Id = ?', [id], (err, rows) => {
            if (err) return callback(err, null);
            callback(null, rows.length ? new Creator(rows[0]) : null);
        });
    }

    /** Find creator by the linked user's ID. Callback: (err, Creator|null) */
    static findByUserId(userId, callback) {
        db.query('SELECT * FROM creator WHERE UserId = ?', [userId], (err, rows) => {
            if (err) return callback(err, null);
            callback(null, rows.length ? new Creator(rows[0]) : null);
        });
    }

    /** Insert a new creator channel. Callback: (err, insertId) */
    static create(userId, channelName, callback) {
        const sql = `INSERT INTO creator (UserId, ChannelName, TotalSubscribers, TotalViews)
                     VALUES (?, ?, 0, 0)`;
        db.query(sql, [userId, channelName], (err, result) => {
            callback(err, result ? result.insertId : null);
        });
    }

    /** Update channel name and bio. */
    static updateProfile(userId, { channelName, bio }, callback) {
        db.query('UPDATE creator SET ChannelName = ?, Bio = ? WHERE UserId = ?',
            [channelName, bio, userId], callback);
    }

    /** Increment total views by the given amount. */
    static incrementViews(id, amount, callback) {
        db.query('UPDATE creator SET TotalViews = TotalViews + ? WHERE Id = ?', [amount, id], callback);
    }

    /** Return all creators joined with user info. Callback: (err, rows[]) */
    static findAllWithUser(callback) {
        const sql = `
            SELECT c.*, u.FirstName, u.LastName, u.Email, u.Country, u.Status
            FROM creator c JOIN user u ON c.UserId = u.Id
            ORDER BY c.TotalSubscribers DESC`;
        db.query(sql, callback);
    }
}

module.exports = Creator;
