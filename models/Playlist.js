const db = require('../config/db');

/**
 * Domain Class: Playlist
 * Represents a user-created video playlist.
 */
class Playlist {
    constructor(data) {
        this.id         = data.Id;
        this.userId     = data.UserId;
        this.title      = data.Title;
        this.visibility = data.Visibility;
        this.createdAt  = data.CreatedAt;
        // Joined fields (optional)
        this.videoCount = data.VideoCount || 0;
    }

    // ── Instance Methods ──────────────────────────────────────

    isPublic()   { return this.visibility === 'Public'; }
    isPrivate()  { return this.visibility === 'Private'; }
    isEmpty()    { return this.videoCount === 0; }

    // ── Static DB Methods ─────────────────────────────────────

    /** Find all playlists for a user with video count. Callback: (err, Playlist[]) */
    static findByUser(userId, callback) {
        const sql = `
            SELECT p.*, COUNT(pi.Id) AS VideoCount
            FROM playlist p
            LEFT JOIN playlistitem pi ON pi.PlaylistId = p.Id
            WHERE p.UserId = ?
            GROUP BY p.Id
            ORDER BY p.CreatedAt DESC`;
        db.query(sql, [userId], (err, rows) => {
            if (err) return callback(err, []);
            callback(null, rows.map(r => new Playlist(r)));
        });
    }

    /** Find a single playlist by ID with its videos. Callback: (err, {playlist, videos}) */
    static findById(id, callback) {
        db.query('SELECT * FROM playlist WHERE Id = ?', [id], (err, rows) => {
            if (err || !rows.length) return callback(err, null);
            const playlist = new Playlist(rows[0]);
            const videoSql = `
                SELECT v.*, cat.Name AS Category, c.ChannelName
                FROM playlistitem pi
                JOIN video v    ON pi.VideoId    = v.Id
                JOIN category cat ON v.CategoryId = cat.Id
                JOIN creator c    ON v.CreatorId  = c.Id
                WHERE pi.PlaylistId = ?
                ORDER BY pi.OrderNo ASC, pi.AddedAt ASC`;
            db.query(videoSql, [id], (err2, videos) => {
                callback(err2, { playlist, videos: videos || [] });
            });
        });
    }

    /** Create a new playlist. Callback: (err, insertId) */
    static create(userId, title, visibility, callback) {
        db.query('INSERT INTO playlist (UserId, Title, Visibility) VALUES (?, ?, ?)',
            [userId, title, visibility || 'Public'], (err, result) => {
                callback(err, result ? result.insertId : null);
            });
    }

    /** Delete a playlist and all its items (cascade). */
    static delete(id, userId, callback) {
        db.query('DELETE FROM playlist WHERE Id = ? AND UserId = ?', [id, userId], callback);
    }

    /** Add a video to a playlist. */
    static addVideo(playlistId, videoId, callback) {
        db.query('INSERT IGNORE INTO playlistitem (PlaylistId, VideoId) VALUES (?, ?)',
            [playlistId, videoId], callback);
    }

    /** Remove a video from a playlist. */
    static removeVideo(playlistId, videoId, callback) {
        db.query('DELETE FROM playlistitem WHERE PlaylistId = ? AND VideoId = ?',
            [playlistId, videoId], callback);
    }
}

module.exports = Playlist;
