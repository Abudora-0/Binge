const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// View engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Redirect root to login
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

// Auth routes
app.get('/auth/login', (req, res) => {
    res.render('login', { error: null });
});

// Start server
app.listen(PORT, () => {
    console.log(`ViewTube running at http://localhost:${PORT}`);
});