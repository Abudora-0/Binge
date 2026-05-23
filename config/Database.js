const mysql  = require('mysql2');
const path   = require('path');
require('dotenv').config();

/**
 * Software Class: Database
 * Singleton wrapper around the MySQL connection.
 * Provides a clean API for queries, transactions, and reconnection.
 */
class Database {
    constructor() {
        this._connection = null;
    }

    // ── Connection ────────────────────────────────────────────

    /** Create and return the MySQL connection (lazy initialisation). */
    getConnection() {
        if (!this._connection) {
            this._connection = mysql.createConnection({
                host:     process.env.DB_HOST,
                user:     process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                multipleStatements: false,
            });
        }
        return this._connection;
    }

    /** Connect to the database. Callback: (err) */
    connect(callback) {
        this.getConnection().connect(callback);
    }

    // ── Query API ─────────────────────────────────────────────

    /** Execute a parameterised SQL query. */
    query(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params   = [];
        }
        return this.getConnection().query(sql, params, callback);
    }

    /** Call a stored procedure: CALL sp_name(?, ?) */
    callProcedure(name, params, callback) {
        const placeholders = params.map(() => '?').join(', ');
        const sql = `CALL ${name}(${placeholders})`;
        return this.getConnection().query(sql, params, callback);
    }

    // ── Transactions ──────────────────────────────────────────

    beginTransaction(callback) {
        return this.getConnection().beginTransaction(callback);
    }

    commit(callback) {
        return this.getConnection().commit(callback);
    }

    rollback(callback) {
        return this.getConnection().rollback(callback);
    }
}

// Export a single shared instance
module.exports = new Database();
