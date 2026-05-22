const db = require('../config/db');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

// Show login page
const showLogin = (req, res) => {
    res.render('login', { error: null, resetError: null, resetSuccess: null, resetEmail: '' });
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
            logger.logError('authController', err.message);
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
                logger.logError('authController', err.message);
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
                        logger.logError('authController', err.message);
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

    const loginError = (msg) => res.render('login', { error: msg, resetError: null, resetSuccess: null, resetEmail: '' });

    // ── Validators ──
    if (!email || !password || !role) return loginError('All fields are required.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return loginError('Please enter a valid email address.');

    // ── Find user ──
    const query = 'SELECT * FROM user WHERE Email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            logger.logError('authController', err.message);
            return loginError('Something went wrong. Please try again.');
        }

        if (results.length === 0) return loginError('No account found with this email.');

        const user = results[0];

        // ── Check password ──
        const passwordMatch = bcrypt.compareSync(password, user.Password);
        if (!passwordMatch) return loginError('Incorrect password.');

        // ── Check status ──
        if (user.Status !== 'Active') return loginError('Your account has been suspended.');

        // ── Store session ──
        req.session.user = {
            id: user.Id,
            firstName: user.FirstName,
            lastName: user.LastName,
            email: user.Email,
            role: role,
            avatar: user.Avatar || null
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

// Handle forgot password (direct reset — no email service required)
const forgotPassword = (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
        return res.render('login', {
            error: null,
            resetError: 'All fields are required.',
            resetEmail: email || ''
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.render('login', {
            error: null,
            resetError: 'Please enter a valid email address.',
            resetEmail: email
        });
    }

    if (newPassword.length < 8) {
        return res.render('login', {
            error: null,
            resetError: 'Password must be at least 8 characters.',
            resetEmail: email
        });
    }

    if (newPassword !== confirmPassword) {
        return res.render('login', {
            error: null,
            resetError: 'Passwords do not match.',
            resetEmail: email
        });
    }

    db.query('SELECT Id FROM user WHERE Email = ?', [email], (err, results) => {
        if (err) {
            logger.logError('forgotPassword', err.message);
            return res.render('login', {
                error: null,
                resetError: 'Something went wrong. Please try again.',
                resetEmail: email
            });
        }

        if (results.length === 0) {
            return res.render('login', {
                error: null,
                resetError: 'No account found with this email address.',
                resetEmail: email
            });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        db.query('UPDATE user SET Password = ? WHERE Email = ?', [hashedPassword, email], (err) => {
            if (err) {
                logger.logError('forgotPassword - update', err.message);
                return res.render('login', {
                    error: null,
                    resetError: 'Failed to update password. Please try again.',
                    resetEmail: email
                });
            }

            res.render('login', {
                error: null,
                resetError: null,
                resetSuccess: 'Password updated successfully! You can now sign in.',
                resetEmail: ''
            });
        });
    });
};

module.exports = { showLogin, showRegister, register, login, logout, forgotPassword };