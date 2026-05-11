const mysql = require('mysql2');
require('dotenv').config();
const logger = require('./logger');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        logger.logError('DatabaseConnection', err.message);
        return;
    }
    logger.logInfo('Connected to BingeDB successfully!');
});

module.exports = db;