const db = require('../config/db');

/**
 * Domain Class: Advertisement
 * Represents a promotional campaign run by a creator on the platform.
 */
class Advertisement {
    constructor(data) {
        this.id        = data.Id;
        this.creatorId = data.CreatorId;
        this.title     = data.Title;
        this.budget    = parseFloat(data.Budget) || 0;
        this.startDate = data.StartDate;
        this.endDate   = data.EndDate;
        this.status    = data.Status;
        // Joined fields (optional)
        this.channelName = data.ChannelName || null;
    }

    // ── Instance Methods ──────────────────────────────────────

    isActive()     { return this.status === 'Active'; }
    isPaused()     { return this.status === 'Paused'; }
    isCompleted()  { return this.status === 'Completed'; }
    isCancelled()  { return this.status === 'Cancelled'; }

    getDurationDays() {
        const ms = new Date(this.endDate) - new Date(this.startDate);
        return Math.ceil(ms / (1000 * 60 * 60 * 24));
    }

    getDailyBudget() {
        const days = this.getDurationDays();
        return days > 0 ? (this.budget / days).toFixed(2) : 0;
    }

    // ── Static DB Methods ─────────────────────────────────────

    /** Get all advertisements with creator name. Callback: (err, Advertisement[]) */
    static findAll(callback) {
        const sql = `
            SELECT a.*, c.ChannelName
            FROM advertisement a
            JOIN creator c ON a.CreatorId = c.Id
            ORDER BY a.StartDate DESC`;
        db.query(sql, (err, rows) => {
            if (err) return callback(err, []);
            callback(null, rows.map(r => new Advertisement(r)));
        });
    }

    /** Get advertisements for a specific creator. Callback: (err, Advertisement[]) */
    static findByCreator(creatorId, callback) {
        db.query('SELECT * FROM advertisement WHERE CreatorId = ? ORDER BY StartDate DESC',
            [creatorId], (err, rows) => {
                if (err) return callback(err, []);
                callback(null, rows.map(r => new Advertisement(r)));
            });
    }

    /** Create a new advertisement campaign. Callback: (err, insertId) */
    static create({ creatorId, title, budget, startDate, endDate }, callback) {
        const sql = `INSERT INTO advertisement (CreatorId, Title, Budget, StartDate, EndDate, Status)
                     VALUES (?, ?, ?, ?, ?, 'Active')`;
        db.query(sql, [creatorId, title, budget, startDate, endDate], (err, result) => {
            callback(err, result ? result.insertId : null);
        });
    }

    /** Update advertisement status. */
    static updateStatus(id, status, callback) {
        db.query('UPDATE advertisement SET Status = ? WHERE Id = ?', [status, id], callback);
    }
}

module.exports = Advertisement;
