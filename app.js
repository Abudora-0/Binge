const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const db = require('./config/db');
const logger = require('./config/logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/uploads', express.static('public/uploads'));

// Session
app.use(session({
    secret: 'binge_secret_key',
    resave: false,
    saveUninitialized: false
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const viewerRoutes = require('./routes/viewerRoutes');
app.use('/viewer', viewerRoutes);

const creatorRoutes = require('./routes/creatorRoutes');
app.use('/creator', creatorRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/reports', reportRoutes);

// Redirect root to login
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

// Global error handler
app.use((err, req, res, next) => {
    logger.logError('GlobalHandler', err.message);
    res.status(500).send('Something went wrong. Please try again.');
});

// Start server
app.listen(PORT, () => {
    console.log(`Binge running at http://localhost:${PORT}`);
});