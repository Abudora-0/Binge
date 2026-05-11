const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const db = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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

// Start server
app.listen(PORT, () => {
    console.log(`Binge running at http://localhost:${PORT}`);
});