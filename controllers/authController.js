const bcrypt    = require('bcryptjs');
const logger    = require('../config/logger');
const User      = require('../models/User');
const Creator   = require('../models/Creator');
const Validator = require('../config/Validator');

// ── Show pages ────────────────────────────────────────────────
const showLogin = (req, res) => {
    res.render('login', { error: null, resetError: null, resetSuccess: null, resetEmail: '' });
};

const showRegister = (req, res) => {
    res.render('register', { error: null, success: null });
};

// ── Register ──────────────────────────────────────────────────
const register = (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, country, role, channelName } = req.body;

    const fail = (msg) => res.render('register', { error: msg, success: null });

    // ── Validate all fields using Validator class ──
    const validation = Validator.validateRegistration(
        { firstName, lastName, email, password, confirmPassword, country, role, channelName }
    );
    if (!validation.valid) return fail(validation.message);

    // ── Check for duplicate email using User model ──
    User.emailExists(email, (err, exists) => {
        if (err) {
            logger.logError('authController.register', err.message);
            return fail('Something went wrong. Please try again.');
        }
        if (exists) return fail('An account with this email already exists.');

        // ── Hash and create user ──
        const hashedPassword = bcrypt.hashSync(password, 10);

        User.create({ firstName, lastName, email, hashedPassword, country }, (err, userId) => {
            if (err) {
                logger.logError('authController.register', err.message);
                return fail('Registration failed. Please try again.');
            }

            if (role === 'creator') {
                Creator.create(userId, channelName, (err) => {
                    if (err) {
                        logger.logError('authController.register - creator', err.message);
                        return fail('Account created but creator setup failed.');
                    }
                    res.render('register', { error: null, success: 'Account created successfully! You can now sign in.' });
                });
            } else {
                res.render('register', { error: null, success: 'Account created successfully! You can now sign in.' });
            }
        });
    });
};

// ── Login ─────────────────────────────────────────────────────
const login = (req, res) => {
    const { email, password, role } = req.body;
    const fail = (msg) => res.render('login', { error: msg, resetError: null, resetSuccess: null, resetEmail: '' });

    // ── Validate ──
    const emailCheck = Validator.validateEmail(email);
    if (!email || !password || !role) return fail('All fields are required.');
    if (!emailCheck.valid) return fail(emailCheck.message);

    // ── Look up user via User model ──
    User.findByEmail(email, (err, user) => {
        if (err) {
            logger.logError('authController.login', err.message);
            return fail('Something went wrong. Please try again.');
        }
        if (!user)                         return fail('No account found with this email.');
        if (!bcrypt.compareSync(password, user.password)) return fail('Incorrect password.');
        if (!user.isActive())              return fail('Your account has been suspended.');

        // ── Store session ──
        req.session.user = {
            id:        user.id,
            firstName: user.firstName,
            lastName:  user.lastName,
            email:     user.email,
            role,
            avatar:    user.avatar
        };

        if (role === 'admin')   return res.redirect('/admin/dashboard');
        if (role === 'creator') return res.redirect('/creator/dashboard');
        return res.redirect('/viewer/home');
    });
};

// ── Logout ────────────────────────────────────────────────────
const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
};

// ── Forgot Password ───────────────────────────────────────────
const forgotPassword = (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    const fail = (msg) => res.render('login', { error: null, resetError: msg, resetEmail: email || '' });

    if (!email || !newPassword || !confirmPassword) return fail('All fields are required.');

    const emailCheck    = Validator.validateEmail(email);
    const passCheck     = Validator.validatePassword(newPassword);
    const matchCheck    = Validator.passwordsMatch(newPassword, confirmPassword);

    if (!emailCheck.valid) return fail(emailCheck.message);
    if (!passCheck.valid)  return fail(passCheck.message);
    if (!matchCheck.valid) return fail(matchCheck.message);

    User.findByEmail(email, (err, user) => {
        if (err) {
            logger.logError('authController.forgotPassword', err.message);
            return fail('Something went wrong. Please try again.');
        }
        if (!user) return fail('No account found with this email address.');

        const hashed = bcrypt.hashSync(newPassword, 10);
        User.updatePassword(email, hashed, (err) => {
            if (err) {
                logger.logError('authController.forgotPassword - update', err.message);
                return fail('Failed to update password. Please try again.');
            }
            res.render('login', {
                error: null, resetError: null,
                resetSuccess: 'Password updated successfully! You can now sign in.',
                resetEmail: ''
            });
        });
    });
};

module.exports = { showLogin, showRegister, register, login, logout, forgotPassword };
