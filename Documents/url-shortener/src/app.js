const express = require('express');
const cors = require('cors');
const urlRoutes = require('./routes/urlRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend dosyalarını (HTML, CSS, JS) dışarı sunan satır:
app.use(express.static('public'));

// Rotaları bağlayan kritik satır:
app.use('/api/v1', urlRoutes);

module.exports = app;