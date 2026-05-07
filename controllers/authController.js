const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Show login page
const showLogin = (req, res) => {
    res.render('login', { error: null });
};

// Show register page
const showRegister = (req, res) => {
    res.render('register', { error: null, success: null });
};

// Handle registration
const register = (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, country, role, channelName } = req.body;

    // ── Validators ──
    if (!firstName || !lastName || !email || !password || !country || !role) {
        return res.render('register', {
            error: 'All fields are required.',
            success: null
        });
    }

    if (firstName.length < 2 || lastName.length < 2) {
        return res.render('register', {
            error: 'First and Last name must be at least 2 characters.',
            success: null
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.render('register', {
            error: 'Please enter a valid email address.',
            success: null
        });
    }

    if (password.length < 8) {
        return res.render('register', {
            error: 'Password must be at least 8 characters.',
            success: null
        });
    }

    if (password !== confirmPassword) {
        return res.render('register', {
            error: 'Passwords do not match.',
            success: null
        });
    }

    if (role === 'creator' && !channelName) {
        return res.render('register', {
            error: 'Channel name is required for creators.',
            success: null
        });
    }

    // ── Check if email already exists ──
    const checkEmail = 'SELECT Id FROM user WHERE Email = ?';
    db.query(checkEmail, [email], (err, results) => {
        if (err) {
            console.error('DB Error:', err.message);
            return res.render('register', {
                error: 'Something went wrong. Please try again.',
                success: null
            });
        }

        if (results.length > 0) {
            return res.render('register', {
                error: 'An account with this email already exists.',
                success: null
            });
        }

        // ── Hash password ──
        const hashedPassword = bcrypt.hashSync(password, 10);

        // ── Insert user ──
        const insertUser = `
            INSERT INTO user (FirstName, LastName, Email, Password, Country, Status)
            VALUES (?, ?, ?, ?, ?, 'Active')
        `;

        db.query(insertUser, [firstName, lastName, email, hashedPassword, country], (err, result) => {
            if (err) {
                console.error('DB Error:', err.message);
                return res.render('register', {
                    error: 'Registration failed. Please try again.',
                    success: null
                });
            }

            const userId = result.insertId;

            // ── If creator, insert into creator table ──
            if (role === 'creator') {
                const insertCreator = `
                    INSERT INTO creator (UserId, ChannelName, TotalSubscribers, TotalViews)
                    VALUES (?, ?, 0, 0)
                `;
                db.query(insertCreator, [userId, channelName], (err) => {
                    if (err) {
                        console.error('DB Error:', err.message);
                        return res.render('register', {
                            error: 'Account created but creator setup failed.',
                            success: null
                        });
                    }

                    return res.render('register', {
                        error: null,
                        success: 'Account created successfully! You can now sign in.'
                    });
                });
            } else {
                return res.render('register', {
                    error: null,
                    success: 'Account created successfully! You can now sign in.'
                });
            }
        });
    });
};

// Handle login
const login = (req, res) => {
    const { email, password, role } = req.body;

    // ── Validators ──
    if (!email || !password || !role) {
        return res.render('login', { error: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.render('login', { error: 'Please enter a valid email address.' });
    }

    // ── Find user ──
    const query = 'SELECT * FROM user WHERE Email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('DB Error:', err.message);
            return res.render('login', { error: 'Something went wrong. Please try again.' });
        }

        if (results.length === 0) {
            return res.render('login', { error: 'No account found with this email.' });
        }

        const user = results[0];

        // ── Check password ──
        const passwordMatch = bcrypt.compareSync(password, user.Password);
        if (!passwordMatch) {
            return res.render('login', { error: 'Incorrect password.' });
        }

        // ── Check status ──
        if (user.Status !== 'Active') {
            return res.render('login', { error: 'Your account has been suspended.' });
        }

        // ── Store session ──
        req.session.user = {
            id: user.Id,
            firstName: user.FirstName,
            lastName: user.LastName,
            email: user.Email,
            role: role
        };

        // ── Redirect based on role ──
        if (role === 'admin') return res.redirect('/admin/dashboard');
        if (role === 'creator') return res.redirect('/creator/dashboard');
        return res.redirect('/viewer/home');
    });
};

// Handle logout
const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
};

module.exports = { showLogin, showRegister, register, login, logout };