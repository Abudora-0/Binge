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

// ── Template helpers (available in all EJS views) ─────────────────────────────
app.locals.formatViews = function(n) {
  if (!n || isNaN(n)) return '0';
  n = Number(n);
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
};

app.locals.timeAgo = function(date) {
  if (!date) return '';
  const now  = new Date();
  const d    = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)       return 'just now';
  if (diff < 3600)   { const m  = Math.floor(diff / 60);           return m  + ' minute' + (m  > 1 ? 's' : '') + ' ago'; }
  if (diff < 86400)  { const h  = Math.floor(diff / 3600);         return h  + ' hour'   + (h  > 1 ? 's' : '') + ' ago'; }
  if (diff < 604800) { const dd = Math.floor(diff / 86400);        return dd + ' day'    + (dd > 1 ? 's' : '') + ' ago'; }
  if (diff < 2592000){ const w  = Math.floor(diff / 604800);       return w  + ' week'   + (w  > 1 ? 's' : '') + ' ago'; }
  if (diff < 31536000){ const mo = Math.floor(diff / 2592000);     return mo + ' month'  + (mo > 1 ? 's' : '') + ' ago'; }
  const yr = Math.floor(diff / 31536000);                           return yr + ' year'   + (yr > 1 ? 's' : '') + ' ago';
};
// ──────────────────────────────────────────────────────────────────────────────

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