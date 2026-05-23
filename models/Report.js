const db = require('../config/db');

/**
 * Domain Class: Report
 * Represents a content report filed by a user against a video.
 */
class Report {
    constructor(data) {
        this.id         = data.Id;
        this.videoId    = data.VideoId;
        this.reportedBy = data.ReportedBy;
        this.reason     = data.Reason;
        this.status     = data.Status;
        this.reportedAt = data.ReportedAt;
        this.resolvedAt = data.ResolvedAt || null;
        // Joined fields (optional)
        this.videoTitle = data.VideoTitle || null;
        this.firstName  = data.FirstName  || null;
        this.lastName   = data.LastName   || null;
    }

    // ── Instance Methods ──────────────────────────────────────

    isPending()     { return this.status === 'Pending'; }
    isReviewed()    { return this.status === 'Reviewed'; }
    isDismissed()   { return this.status === 'Dismissed'; }
    isActioned()    { return this.status === 'ActionTaken'; }
    isResolved()    { return !this.isPending(); }
    getReporter()   { return `${this.firstName} ${this.lastName}`; }

    getDaysSinceReport() {
        return Math.floor((Date.now() - new Date(this.reportedAt).getTime()) / 86400000);
    }

    // ── Static DB Methods ─────────────────────────────────────

    /** Get all reports with video and reporter info. Callback: (err, Report[]) */
    static findAll(callback) {
        const sql = `
            SELECT r.*, v.Title AS VideoTitle, u.FirstName, u.LastName
            FROM report r
            JOIN video v ON r.VideoId    = v.Id
            JOIN user u  ON r.ReportedBy = u.Id
            ORDER BY r.ReportedAt DESC`;
        db.query(sql, (err, rows) => {
            if (err) return callback(err, []);
            callback(null, rows.map(r => new Report(r)));
        });
    }

    /** Get pending reports only. Callback: (err, Report[]) */
    static findPending(callback) {
        const sql = `
            SELECT r.*, v.Title AS VideoTitle, u.FirstName, u.LastName
            FROM report r
            JOIN video v ON r.VideoId    = v.Id
            JOIN user u  ON r.ReportedBy = u.Id
            WHERE r.Status = 'Pending'
            ORDER BY r.ReportedAt ASC`;
        db.query(sql, (err, rows) => {
            if (err) return callback(err, []);
            callback(null, rows.map(r => new Report(r)));
        });
    }

    /** File a new report. Callback: (err) */
    static create(videoId, reportedBy, reason, callback) {
        db.query('INSERT INTO report (VideoId, ReportedBy, Reason) VALUES (?, ?, ?)',
            [videoId, reportedBy, reason], callback);
    }

    /** Dismiss a report. */
    static dismiss(id, callback) {
        db.query(`UPDATE report SET Status = 'Dismissed', ResolvedAt = NOW() WHERE Id = ?`,
            [id], callback);
    }

    /** Mark a report as actioned (content removed/warned). */
    static action(id, callback) {
        db.query(`UPDATE report SET Status = 'ActionTaken', ResolvedAt = NOW() WHERE Id = ?`,
            [id], callback);
    }

    /** Count pending reports. Callback: (err, count) */
    static countPending(callback) {
        db.query(`SELECT COUNT(*) AS cnt FROM report WHERE Status = 'Pending'`, (err, rows) => {
            callback(err, rows ? rows[0].cnt : 0);
        });
    }
}

module.exports = Report;
