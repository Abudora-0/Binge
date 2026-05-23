const db = require('../config/db');

/**
 * Domain Class: Subscription
 * Represents a viewer's subscription to a creator channel.
 */
class Subscription {
    constructor(data) {
        this.id            = data.Id;
        this.viewerId      = data.ViewerId;
        this.creatorId     = data.CreatorId;
        this.subscribedAt  = data.SubscribedAt;
        this.notifyEnabled = data.NotifyEnabled !== undefined ? !!data.NotifyEnabled : true;
        // Joined fields (optional)
        this.channelName  = data.ChannelName      || null;
        this.avatar       = data.Avatar           || null;
        this.totalSubs    = data.TotalSubscribers  || 0;
    }

    // ── Instance Methods ──────────────────────────────────────

    getDaysSinceSubscription() {
        const diff = Date.now() - new Date(this.subscribedAt).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    // ── Static DB Methods ─────────────────────────────────────

    /** Check whether a viewer is subscribed to a creator. Callback: (err, bool) */
    static isSubscribed(viewerId, creatorId, callback) {
        db.query('SELECT Id FROM subscription WHERE ViewerId = ? AND CreatorId = ?',
            [viewerId, creatorId], (err, rows) => {
                callback(err, rows ? rows.length > 0 : false);
            });
    }

    /** Subscribe atomically (insert + update count). */
    static subscribe(viewerId, creatorId, callback) {
        db.beginTransaction((err) => {
            if (err) return callback(err);
            db.query('INSERT INTO subscription (ViewerId, CreatorId, NotifyEnabled) VALUES (?, ?, 1)',
                [viewerId, creatorId], (err) => {
                    if (err) return db.rollback(() => callback(err));
                    db.query('UPDATE creator SET TotalSubscribers = TotalSubscribers + 1 WHERE Id = ?',
                        [creatorId], (err) => {
                            if (err) return db.rollback(() => callback(err));
                            db.commit(callback);
                        });
                });
        });
    }

    /** Unsubscribe atomically (delete + update count). */
    static unsubscribe(viewerId, creatorId, callback) {
        db.beginTransaction((err) => {
            if (err) return callback(err);
            db.query('DELETE FROM subscription WHERE ViewerId = ? AND CreatorId = ?',
                [viewerId, creatorId], (err) => {
                    if (err) return db.rollback(() => callback(err));
                    db.query(`UPDATE creator
                              SET TotalSubscribers = GREATEST(0, TotalSubscribers - 1)
                              WHERE Id = ?`,
                        [creatorId], (err) => {
                            if (err) return db.rollback(() => callback(err));
                            db.commit(callback);
                        });
                });
        });
    }

    /** Get all subscriptions for a viewer with creator info. Callback: (err, Subscription[]) */
    static findByViewer(viewerId, callback) {
        const sql = `
            SELECT s.*, c.ChannelName, u.Avatar, c.TotalSubscribers
            FROM subscription s
            JOIN creator c ON s.CreatorId = c.Id
            JOIN user u    ON c.UserId    = u.Id
            WHERE s.ViewerId = ?
            ORDER BY s.SubscribedAt DESC`;
        db.query(sql, [viewerId], (err, rows) => {
            if (err) return callback(err, []);
            callback(null, rows.map(r => new Subscription(r)));
        });
    }
}

module.exports = Subscription;
