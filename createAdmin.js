const db = require('./config/db');
const bcrypt = require('bcryptjs');

const password = bcrypt.hashSync('admin123', 10);

db.query(
    `INSERT INTO user (FirstName, LastName, Email, Password, Country, Status)
     VALUES ('Admin', 'Binge', 'admin@binge.com', ?, 'Pakistan', 'Active')`,
    [password],
    (err, result) => {
        if (err) {
            console.error('Error:', err.message);
        } else {
            console.log('Admin created successfully! ID:', result.insertId);
        }
        process.exit();
    }
);