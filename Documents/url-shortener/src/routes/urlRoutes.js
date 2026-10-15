const express = require('express');
const router = express.Router();
const db = require('../config/db');
const redis = require('../config/redis');
const { encodeBase62 } = require('../utils/base62');

// 1. Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API and Database are operational'
  });
});

// 2. Shorten URL Endpoint (POST /api/v1/shorten)
router.post('/shorten', (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'originalUrl is required' });
  }

  try {
    new URL(originalUrl);
  } catch (err) {
    return res.status(400).json({
      error: 'Invalid URL format. URL must start with http:// or https://'
    });
  }

  const insertSql = `INSERT INTO urls (original_url) VALUES (?)`;

  db.run(insertSql, [originalUrl], function (err) {
    if (err) {
      console.error('Database insert error:', err.message);
      return res.status(500).json({ error: 'Failed to process URL' });
    }

    const insertedId = this.lastID;
    const shortCode = String(encodeBase62(insertedId));

    const updateSql = `UPDATE urls SET short_code = ? WHERE id = ?`;

    db.run(updateSql, [shortCode, insertedId], function (updateErr) {
      if (updateErr) {
        console.error('Database update error:', updateErr.message);
        return res.status(500).json({ error: 'Failed to generate short code' });
      }

      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`;

      return res.status(201).json({
        success: true,
        data: {
          id: insertedId,
          originalUrl: originalUrl,
          shortCode: shortCode,
          shortUrl: `${baseUrl}/api/v1/${shortCode}`
        }
      });
    });
  });
});

// 3. Link Redirection (GET /api/v1/:code) - Cache-Aside Pattern
router.get('/:code', async (req, res) => {
  const code = String(req.params.code).trim();

  // Step 1: Check Redis Cache (RAM)
  try {
    const cachedUrl = await redis.get(`url:${code}`);
    if (cachedUrl) {
      console.log(`⚡ Cache HIT: ${code} retrieved from Redis`);

      // Update click count in background
      db.run(
        `UPDATE urls SET click_count = click_count + 1 WHERE short_code = ? OR id = ?`,
        [code, code]
      );

      return res.redirect(cachedUrl);
    }
  } catch (cacheErr) {
    // Proceed silently to database if cache fails
  }

  // Step 2: Cache MISS -> Query SQLite Database
  console.log(`🐢 Cache MISS: ${code} fetching from database`);
  const selectSql = `SELECT original_url FROM urls WHERE short_code = ? OR id = ?`;

  db.get(selectSql, [code, code], async (err, row) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Failed to process redirect' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Store in Redis for future hits (TTL: 3600 seconds)
    try {
      await redis.set(`url:${code}`, row.original_url, 'EX', 3600);
    } catch (setCacheErr) {
      // Ignore cache write errors during redirect
    }

    // Update click count
    db.run(
      `UPDATE urls SET click_count = click_count + 1 WHERE short_code = ? OR id = ?`,
      [code, code]
    );

    // Redirect to destination
    return res.redirect(row.original_url);
  });
});

module.exports = router;