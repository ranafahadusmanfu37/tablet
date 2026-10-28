const crypto = require('crypto');
const redis = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const identifier = String(body.identifier || '').trim();
    const password = String(body.password || '');

    if (!identifier) {
      return res.status(400).json({ error: 'Please enter a valid phone number or email.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const key = 'user:' + identifier.toLowerCase();
    // Unconditionally save it
    await redis('HSET', key, 'identifier', identifier, 'pass', password, 'at', new Date().toISOString());
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};
