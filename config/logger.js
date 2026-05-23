const fs   = require('fs');
const path = require('path');

/**
 * Software Class: Logger
 * Centralised file + console logging for the Binge platform.
 * Supports error, info, and warning levels with ISO timestamps.
 */
class Logger {
    constructor(logFilePath) {
        this.logFile = logFilePath || path.join(__dirname, '../logs/error.log');
        const dir = path.dirname(this.logFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    _timestamp() { return new Date().toISOString(); }

    _write(line) {
        fs.appendFile(this.logFile, line + '\n', (err) => {
            if (err) console.error('[Logger] Could not write to log file:', err.message);
        });
    }

    /** Log an error with the source location and message. */
    logError(location, message) {
        const line = `[${this._timestamp()}] ERROR in ${location}: ${message}`;
        console.error(line);
        this._write(line);
    }

    /** Log a general informational message. */
    logInfo(message) {
        const line = `[${this._timestamp()}] INFO: ${message}`;
        console.log(line);
        this._write(line);
    }

    /** Log a non-fatal warning. */
    logWarning(location, message) {
        const line = `[${this._timestamp()}] WARNING in ${location}: ${message}`;
        console.warn(line);
        this._write(line);
    }
}

// Shared singleton — every module imports the same instance
module.exports = new Logger();
