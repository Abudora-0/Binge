const db = require('../config/db');

/**
 * Domain Class: User
 * Represents a registered user (viewer, creator, or admin).
 */
class User {
    constructor(data) {
        this.id        = data.Id;
        this.firstName = data.FirstName;
        this.lastName  = data.LastName;
        this.email     = data.Email;
        this.password  = data.Password || null; // only populated when needed for auth
        this.country   = data.Country;
        this.status    = data.Status;
        this.avatar    = data.Avatar || null;
        this.joinDate  = data.JoinDate;
    }

    // ── Instance Methods ──────────────────────────────────────

    getFullName()   { return `${this.firstName} ${this.lastName}`; }
    isActive()      { return this.status === 'Active'; }
    isSuspended()   { return this.status === 'Suspended'; }
    hasAvatar()     { return this.avatar !== null; }
    getInitial()    { return this.firstName.charAt(0).toUpperCase(); }

    // ── Static DB Methods ─────────────────────────────────────

    /** Find a user by primary key. Callback: (err, User|null) */
    static findById(id, callback) {
        db.query('SELECT * FROM user WHERE Id = ?', [id], (err, rows) => {
            if (err) return callback(err, null);
            callback(null, rows.length ? new User(rows[0]) : null);
        });
    }

    /** Find a user by email — includes hashed password for login checks. */
    static findByEmail(email, callback) {
        db.query('SELECT * FROM user WHERE Email = ?', [email], (err, rows) => {
            if (err) return callback(err, null);
            callback(null, rows.length ? new User(rows[0]) : null);
        });
    }

    /** Check whether an email is already registered. Callback: (err, bool) */
    static emailExists(email, callback) {
        db.query('SELECT Id FROM user WHERE Email = ?', [email], (err, rows) => {
            if (err) return callback(err, false);
            callback(null, rows.length > 0);
        });
    }

    /** Insert a new user row. Callback: (err, insertId) */
    static create({ firstName, lastName, email, hashedPassword, country }, callback) {
        const sql = `INSERT INTO user (FirstName, LastName, Email, Password, Country, Status)
                     VALUES (?, ?, ?, ?, ?, 'Active')`;
        db.query(sql, [firstName, lastName, email, hashedPassword, country], (err, result) => {
            callback(err, result ? result.insertId : null);
        });
    }

    /** Update the user's hashed password. */
    static updatePassword(email, hashedPassword, callback) {
        db.query('UPDATE user SET Password = ? WHERE Email = ?', [hashedPassword, email], callback);
    }

    /** Toggle user account status (Active ↔ Suspended). */
    static updateStatus(id, status, callback) {
        db.query('UPDATE user SET Status = ? WHERE Id = ?', [status, id], callback);
    }

    /** Update profile information. */
    static updateProfile(id, { firstName, lastName, country }, callback) {
        db.query('UPDATE user SET FirstName = ?, LastName = ?, Country = ? WHERE Id = ?',
            [firstName, lastName, country, id], callback);
    }

    /** Update avatar filename. */
    static updateAvatar(id, filename, callback) {
        db.query('UPDATE user SET Avatar = ? WHERE Id = ?', [filename, id], callback);
    }

    /** Return all users ordered by join date. Callback: (err, User[]) */
    static findAll(callback) {
        db.query('SELECT * FROM user ORDER BY JoinDate DESC', (err, rows) => {
            if (err) return callback(err, []);
            callback(null, rows.map(r => new User(r)));
        });
    }
}

module.exports = User;
