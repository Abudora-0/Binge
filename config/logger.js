const fs   = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../logs/error.log');

// Create logs folder if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

function logError(location, error) {
    const timestamp = new Date().toISOString();
    const message   = `[${timestamp}] ERROR in ${location}: ${error}\n`;

    // Write to file
    fs.appendFileSync(logFile, message, 'utf8');

    // Also print to console
    console.error(message);
}

function logInfo(message) {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] INFO: ${message}\n`;
    fs.appendFileSync(logFile, log, 'utf8');
    console.log(log);
}

module.exports = { logError, logInfo };