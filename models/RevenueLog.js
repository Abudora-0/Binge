const db = require('../config/db');

/**
 * Domain Class: RevenueLog
 * Records estimated monthly ad revenue per creator channel.
 */
class RevenueLog {
    constructor(data) {
        this.id               = data.Id;
        this.creatorId        = data.CreatorId;
        this.month            = data.Month;
        this.year             = data.Year;
        this.totalViews       = data.TotalViews || 0;
        this.estimatedRevenue = parseFloat(data.EstimatedRevenue) || 0;
        // Joined fields (optional)
        this.channelName = data.ChannelName || null;
    }

    // ── Instance Methods ──────────────────────────────────────

    getMonthLabel() {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${months[this.month - 1]} ${this.year}`;
    }

    getRevenuePerView() {
        return this.totalViews > 0
            ? (this.estimatedRevenue / this.totalViews).toFixed(5)
            : '0.00000';
    }

    // ── Static DB Methods ─────────────────────────────────────

    /** Get all revenue logs with creator names. Callback: (err, RevenueLog[]) */
    static findAll(callback) {
        const sql = `
            SELECT rl.*, c.ChannelName
            FROM revenuelog rl
            JOIN creator c ON rl.CreatorId = c.Id
            ORDER BY rl.Year DESC, rl.Month DESC`;
        db.query(sql, (err, rows) => {
            if (err) return callback(err, []);
            callback(null, rows.map(r => new RevenueLog(r)));
        });
    }

    /** Get revenue logs for a specific creator. Callback: (err, RevenueLog[]) */
    static findByCreator(creatorId, callback) {
        db.query(
            'SELECT * FROM revenuelog WHERE CreatorId = ? ORDER BY Year DESC, Month DESC',
            [creatorId], (err, rows) => {
                if (err) return callback(err, []);
                callback(null, rows.map(r => new RevenueLog(r)));
            }
        );
    }

    /** Upsert monthly revenue record (insert or update if already exists). */
    static upsert(creatorId, month, year, totalViews, estimatedRevenue, callback) {
        const sql = `
            INSERT INTO revenuelog (CreatorId, Month, Year, TotalViews, EstimatedRevenue)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                TotalViews       = VALUES(TotalViews),
                EstimatedRevenue = VALUES(EstimatedRevenue)`;
        db.query(sql, [creatorId, month, year, totalViews, estimatedRevenue], callback);
    }

    /** Total lifetime revenue for a creator. Callback: (err, number) */
    static totalByCreator(creatorId, callback) {
        db.query(
            'SELECT COALESCE(SUM(EstimatedRevenue), 0) AS Total FROM revenuelog WHERE CreatorId = ?',
            [creatorId], (err, rows) => {
                callback(err, rows ? parseFloat(rows[0].Total) : 0);
            }
        );
    }
}

module.exports = RevenueLog;
