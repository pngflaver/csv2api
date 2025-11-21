// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const Busboy = require('busboy');
const csvParser = require('csv-parser');
const crypto = require('crypto');

// --- Password Management ---
const passwordPath = path.join(__dirname, 'chest.txt');
let storedPassword = 'password';
async function loadPassword() {
  try {
    storedPassword = (await fsp.readFile(passwordPath, 'utf8')).trim();
    if (!storedPassword) throw new Error('Empty password file');
  } catch {
    storedPassword = 'password';
    await fsp.writeFile(passwordPath, storedPassword, 'utf8');
    console.log('[server] No password found, set default password in chest.txt');
  }
}
// Load password on startup
loadPassword();

// Helper to update password
async function updatePassword(newPassword) {
  storedPassword = newPassword;
  await fsp.writeFile(passwordPath, storedPassword, 'utf8');
}

const app = express();

// --- Persistent Password Management ---
const bcrypt = require('bcrypt');
const passwordFile = path.join(__dirname, 'chest.txt');
let hashedPassword = null;

// Load or initialize password
if (fs.existsSync(passwordFile)) {
  hashedPassword = fs.readFileSync(passwordFile, 'utf8');
} else {
  hashedPassword = bcrypt.hashSync('password', 10); // default password
  fs.writeFileSync(passwordFile, hashedPassword, 'utf8');
}

// Login endpoint (persistent)
app.post('/api/login', express.json(), async (req, res) => {
  const { username, password } = req.body;
  if (username !== 'bruce') {
    return res.status(401).json({ error: 'Invalid username' });
  }
  if (await bcrypt.compare(password, hashedPassword)) {
    // ...issue token or session as needed...
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Change password endpoint (persistent)
app.post('/api/change-password', express.json(), async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });
  if (await bcrypt.compare(oldPassword, hashedPassword)) {
    hashedPassword = await bcrypt.hash(newPassword, 10);
    fs.writeFileSync(passwordFile, hashedPassword, 'utf8');
    res.json({ success: true });
  } else {
    res.status(403).json({ error: 'Incorrect old password' });
  }
});
// --- API Logs Endpoint ---
// Returns the latest N log entries for /api/lookup, /api/search, /api/check
app.get('/api/logs', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const logPath = path.join(__dirname, 'api-requests.ndjson');
  let lines = [];
  try {
    const data = await fsp.readFile(logPath, 'utf8');
    lines = data.trim().split(/\r?\n/).filter(Boolean);
  } catch {
    return res.json([]);
  }
  // Parse and filter logs
  const relevant = lines
    .map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(entry => entry && ['/api/lookup', '/api/search', '/api/check'].some(p => (entry.path||'').includes(p)))
    .slice(-limit)
    .reverse()
    .map(entry => ({
      time: entry.timestamp,
      method: entry.method,
      path: entry.path,
      status: entry.status,
      duration: entry.durationMs,
      ip: (entry.ip||'').replace(/^::ffff:/, ''),
      agent: entry.userAgent,
      token: entry.apiToken
    }));
  res.json(relevant);
});
// Ensure JSON and URL-encoded body parsing is registered before any routes or middleware
app.use(express.json({ limit: process.env.BODY_LIMIT || '50mb' }));
app.use(express.urlencoded({ limit: process.env.BODY_LIMIT || '50mb', extended: true }));

// --- API Key Management ---
const apiKeyPath = path.join(__dirname, 'api.key');
const lookupKeyPath = path.join(__dirname, 'lookup.key');
let apiKey = '';
let lookupKey = '';

function normalizeKey(key) {
  return (typeof key === 'string' ? key.trim() : '').replace(/\r|\n/g, '');
}

async function loadApiKeys() {
  try {
    // Internal API key
    let newApiKey;
    try {
      newApiKey = normalizeKey(await fsp.readFile(apiKeyPath, 'utf8'));
    } catch {
      newApiKey = null;
    }
    if (newApiKey) {
      if (newApiKey !== apiKey) {
        apiKey = newApiKey;
        console.log('[server] Loaded API key from api.key');
      }
    } else {
      apiKey = `csv-api-${crypto.randomUUID()}`;
      await fsp.writeFile(apiKeyPath, apiKey, 'utf8');
      console.log('[server] No API key found, generated a new one and saved to api.key');
    }
    // Lookup API key
    let newLookupKey;
    try {
      newLookupKey = normalizeKey(await fsp.readFile(lookupKeyPath, 'utf8'));
    } catch {
      newLookupKey = null;
    }
    if (newLookupKey) {
      if (newLookupKey !== lookupKey) {
        lookupKey = newLookupKey;
        console.log('[server] Loaded lookup key from lookup.key');
      }
    } else {
      lookupKey = `csv-api-lookup-${crypto.randomUUID()}`;
      await fsp.writeFile(lookupKeyPath, lookupKey, 'utf8');
      console.log('[server] No lookup key found, generated a new one and saved to lookup.key');
    }
  } catch (err) {
    console.error('[server] FATAL: Could not read or write API key files:', err);
    process.exit(1);
  }
}

// Load both API keys initially
loadApiKeys();

// Watch for changes in the API key files
fs.watch(apiKeyPath, (eventType) => {
  if (eventType === 'change') {
    console.log('[server] api.key file changed, reloading...');
    loadApiKeys();
  }
});
fs.watch(lookupKeyPath, (eventType) => {
  if (eventType === 'change') {
    console.log('[server] lookup.key file changed, reloading...');
    loadApiKeys();
  }
});

// ---
// Cache for last upload date
const lastUploadPath = path.join(__dirname, 'last-upload.txt');
let lastUploadCache = null;
async function loadLastUpload() {
  try {
    lastUploadCache = await fsp.readFile(lastUploadPath, 'utf8');
  } catch (e) {
    lastUploadCache = null;
  }
}
// Load on startup
loadLastUpload();

// Middleware to log all /api/* requests to a local NDJSON file with source IP and user agent
const apiRequestsNDJSONPath = path.join(__dirname, 'api-requests.ndjson');
app.use('/api', (req, res, next) => {
  const start = Date.now();
  const remote = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || (req.connection && req.connection.remoteAddress) || '';
  const userAgent = req.get('user-agent') || '';
  // Extract API token from header/query
  const headerKey = req.get('x-api-key');
  const auth = req.get('authorization');
  const bearer = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const queryKey = req.query && (req.query.api_key || req.query.apikey);
  const key = headerKey || bearer || queryKey;
  // Mask token for log (show first 4, last 4, mask rest)
  let maskedToken = null;
  if (key && typeof key === 'string') {
    maskedToken = key.length > 12 ? key.slice(0, 4) + '...' + key.slice(-4) : key;
  }
  res.on('finish', () => {
    const entry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
      ip: remote,
      userAgent,
      apiToken: maskedToken
    };
    try {
      fs.appendFileSync(apiRequestsNDJSONPath, JSON.stringify(entry) + '\n', 'utf8');
    } catch (err) {
      // If logging fails, print to stderr
      console.error('[log] Failed to write api-requests.ndjson:', err);
    }
  });
  next();
});

async function readData() {
  try {
    const json = await fsp.readFile(path.join(__dirname, 'data.json'), 'utf8');
    return JSON.parse(json);
  } catch (e) {
    return [];
  }
}

// Stream-search NDJSON file for matching rows (returns up to `limit` results)
function streamSearch(query, limit = 50) {
  return new Promise((resolve, reject) => {
    const results = [];
    const q = String(query || '').toLowerCase();
    const ndPath = path.join(__dirname, 'data.ndjson');
    if (!fs.existsSync(ndPath)) return resolve(results);
    const stream = fs.createReadStream(ndPath, { encoding: 'utf8' });
    let leftover = '';
    stream.on('data', chunk => {
      const text = leftover + chunk;
      const lines = text.split(/\r?\n/);
      leftover = lines.pop();
      for (const line of lines) {
        if (!line) continue;
        try {
          const row = JSON.parse(line);
          const vals = Object.values(row).slice(0,2).map(v => String(v||'').toLowerCase());
          if (vals.some(v => v.includes(q))) {
            results.push(row);
            if (results.length >= limit) {
              stream.destroy();
              return resolve(results);
            }
          }
        } catch (e) {
          // ignore parse errors per-line
        }
      }
    });
    stream.on('end', () => resolve(results));
    stream.on('error', err => reject(err));
  });
}

// Stream-lookup for exact match on first two columns
function streamLookup(email, firstName) {
  return new Promise((resolve, reject) => {
    const e = String(email || '').toLowerCase();
    const f = String(firstName || '').toLowerCase();
    const ndPath = path.join(__dirname, 'data.ndjson');
    if (!fs.existsSync(ndPath)) return resolve(null);
    const stream = fs.createReadStream(ndPath, { encoding: 'utf8' });
    let leftover = '';
    stream.on('data', chunk => {
      const text = leftover + chunk;
      const lines = text.split(/\r?\n/);
      leftover = lines.pop();
      for (const line of lines) {
        if (!line) continue;
        try {
          const row = JSON.parse(line);
          const vals = Object.values(row);
          const col0 = String(vals[0]||'').toLowerCase();
          const col1 = String(vals[1]||'').toLowerCase();
          if (col0 === e && col1 === f) {
            stream.destroy();
            return resolve(row);
          }
        } catch (e) {}
      }
    });
    stream.on('end', () => resolve(null));
    stream.on('error', err => reject(err));
  });
}

// Secure compare (constant time)
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Middleware to validate internal API key
function requireApiKey(req, res, next) {
  const headerKey = req.get('x-api-key');
  const auth = req.get('authorization');
  const bearer = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const queryKey = req.query && (req.query.api_key || req.query.apikey);
  const keyRaw = headerKey || bearer || queryKey;
  const key = normalizeKey(keyRaw);
  const expected = normalizeKey(apiKey);
  if (!key) {
    return res.status(401).json({ error: 'Unauthorized: API key is missing' });
  }
  if (!safeCompare(key, expected)) {
    // Log masked received and expected tokens for debugging
    const mask = t => (t && t.length > 12 ? t.slice(0, 4) + '...' + t.slice(-4) : t);
    console.warn(`[auth] Invalid API key. Received: ${mask(key)}, Expected: ${mask(expected)}`);
    return res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }
  next();
}
// Middleware to validate lookup API key
function requireLookupKey(req, res, next) {
  const headerKey = req.get('x-api-key');
  const auth = req.get('authorization');
  const bearer = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const queryKey = req.query && (req.query.api_key || req.query.apikey);
  const keyRaw = headerKey || bearer || queryKey;
  const key = normalizeKey(keyRaw);
  const expected = normalizeKey(lookupKey);
  if (!key) {
    return res.status(401).json({ error: 'Unauthorized: Lookup API key is missing' });
  }
  if (!safeCompare(key, expected)) {
    // Log masked received and expected tokens for debugging
    const mask = t => (t && t.length > 12 ? t.slice(0, 4) + '...' + t.slice(-4) : t);
    console.warn(`[auth] Invalid lookup API key. Received: ${mask(key)}, Expected: ${mask(expected)}`);
    return res.status(403).json({ error: 'Forbidden: Invalid lookup API key' });
  }
  next();
}

// Endpoint to get the current API keys (unprotected)
app.get('/api/get-api-key', (req, res) => {
  res.json({ apiKey, lookupKey });
});

// Endpoint to set/update the internal API key (protected)
app.post('/api/set-api-key', requireApiKey, async (req, res) => {
  const { newApiKey } = req.body;
  if (!newApiKey || typeof newApiKey !== 'string' || newApiKey.length < 8) {
    return res.status(400).json({ error: 'Invalid new API key. Must be a string of at least 8 characters.' });
  }
  try {
    await fsp.writeFile(apiKeyPath, newApiKey, 'utf8');
    res.json({ success: true, apiKey: newApiKey });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update API key.' });
  }
});

// Endpoint to set/update the lookup API key (protected by internal key)
app.post('/api/set-lookup-key', requireApiKey, async (req, res) => {
  const { newLookupKey } = req.body;
  if (!newLookupKey || typeof newLookupKey !== 'string' || newLookupKey.length < 8) {
    return res.status(400).json({ error: 'Invalid new lookup API key. Must be a string of at least 8 characters.' });
  }
  try {
    await fsp.writeFile(lookupKeyPath, newLookupKey, 'utf8');
    res.json({ success: true, lookupKey: newLookupKey });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lookup API key.' });
  }
});


// JSON parse error handler (returns JSON instead of HTML)
app.use((err, req, res, next) => {
  if (err && err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  next(err);
});

function matchRow(row, q) {
  q = String(q || '').toLowerCase();
  // Only match against the first two columns (values) of the CSV row
  const vals = Object.values(row).slice(0, 2);
  return vals.some(v => String(v || '').toLowerCase().includes(q));
}

app.post('/api/search', requireApiKey, async (req, res) => {
  const { query = '', limit = 50 } = req.body || {};
  try {
    // prefer ndjson streaming for large files
    const ndPath = path.join(__dirname, 'data.ndjson');
    if (fs.existsSync(ndPath)) {
      const results = await streamSearch(query, limit);
      return res.json({ query, count: results.length, results });
    }
    const data = readData();
    const results = data.filter(r => matchRow(r, query)).slice(0, limit);
    res.json({ query, count: results.length, results });
  } catch (err) {
    return res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/data', requireApiKey, (req, res) => {
  const data = readData();
  res.json({ count: data.length, data });
});

// Lookup endpoint: requires both email (first column) and firstName (second column)

// Simple in-memory rate limiter for /api/lookup (per-IP, 5 requests per minute)
const lookupRateLimit = {};
const LOOKUP_LIMIT = 5;
const LOOKUP_WINDOW_MS = 60 * 1000;

function rateLimitLookup(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || (req.connection && req.connection.remoteAddress) || '';
  const now = Date.now();
  if (!lookupRateLimit[ip]) {
    lookupRateLimit[ip] = [];
  }
  // Remove timestamps older than window
  lookupRateLimit[ip] = lookupRateLimit[ip].filter(ts => now - ts < LOOKUP_WINDOW_MS);
  if (lookupRateLimit[ip].length >= LOOKUP_LIMIT) {
    return res.status(429).json({ error: `Rate limit exceeded: max ${LOOKUP_LIMIT} requests per minute.` });
  }
  lookupRateLimit[ip].push(now);
  next();
}

app.post('/api/lookup', rateLimitLookup, requireLookupKey, async (req, res) => {
  // Accept either object with named fields or positional array [col1, col2]
  let email = null, firstName = null;
  const body = req.body;
  if (Array.isArray(body)) {
    email = body[0];
    firstName = body[1];
  } else if (body && typeof body === 'object') {
    email = body.email || body[0] || body.col1 || body["0"];
    firstName = body.firstName || body[1] || body.col2 || body["1"];
  }
  const lastUpload = lastUploadCache;
  try {
    if (!email || !firstName) {
      return res.status(400).json({ status: 400, lastUpload });
    }
    const e = String(email).toLowerCase();
    const f = String(firstName).toLowerCase();
    let match = null;
    const ndPath = path.join(__dirname, 'data.ndjson');
    if (fs.existsSync(ndPath)) {
      match = await streamLookup(email, firstName);
    } else {
      const data = readData();
      match = data.find(row => {
        const vals = Object.values(row);
        const col0 = String(vals[0] || '').toLowerCase();
        const col1 = String(vals[1] || '').toLowerCase();
        return col0 === e && col1 === f;
      });
    }
    if (!match) {
      return res.status(404).json({ status: 404, lastUpload });
    }
    return res.status(200).json({ status: 200, lastUpload });
  } catch (err) {
    return res.status(500).json({ status: 500, lastUpload });
  }
});

// /api/check: Same as /api/lookup but uses internal API key
app.post('/api/check', requireApiKey, async (req, res) => {
  const start = Date.now();
  let email = null, firstName = null;
  const body = req.body;
  if (Array.isArray(body)) {
    email = body[0];
    firstName = body[1];
  } else if (body && typeof body === 'object') {
    email = body.email || body[0] || body.col1 || body["0"];
    firstName = body.firstName || body[1] || body.col2 || body["1"];
  }

  // Get Bearer token (masked)
  let bearer = null;
  const auth = req.get('authorization');
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    bearer = token.length > 10 ? token.slice(0, 4) + '...' + token.slice(-6) : token;
  }
  const remote = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || (req.connection && req.connection.remoteAddress) || '';

  let status = 200;
  let error = null;
  let result = null;
  const lastUpload = lastUploadCache;
  try {
    if (!email || !firstName) {
      status = 400;
      error = 'Provide two values: [col1, col2] or {"email":..., "firstName":...}.';
      res.status(status).json({ error, lastUpload });
    } else {
      const e = String(email).toLowerCase();
      const f = String(firstName).toLowerCase();
      let match = null;
      const ndPath = path.join(__dirname, 'data.ndjson');
      if (fs.existsSync(ndPath)) {
        match = await streamLookup(email, firstName);
      } else {
        const data = readData();
        match = data.find(row => {
          const vals = Object.values(row);
          const col0 = String(vals[0] || '').toLowerCase();
          const col1 = String(vals[1] || '').toLowerCase();
          return col0 === e && col1 === f;
        });
      }
      if (!match) {
        status = 404;
        error = 'No record found matching both values.';
        res.status(status).json({ error, lastUpload });
      } else {
        const vals = Object.values(match);
        const last = match['Last name'] || match['LastName'] || match['Surname'] || vals[2] || '';
        const licenses = match['Licenses'] || match['License'] || match['AssignedLicenses'] || 'Unlicensed';
        result = {
          'User principal name': vals[0] || '',
          'First name': vals[1] || '',
          'Last name': last,
          'Licenses': licenses,
          lastUpload
        };
        res.json(result);
      }
    }
  } catch (err) {
    status = 500;
    error = 'Check failed';
    res.status(status).json({ error, lastUpload });
  }
});

// Accept uploaded CSV JSON data and persist to server/data.json
app.post('/api/upload', requireApiKey, async (req, res) => {
  // For JSON body uploads (smaller files), accept and write NDJSON
  const payload = req.body;
  const rows = Array.isArray(payload) ? payload : payload && payload.data ? payload.data : null;
  if (rows && Array.isArray(rows)) {
    try {
      const ndPath = path.join(__dirname, 'data.ndjson');
      let wrote = 0;
      const lines = rows.map(row => {
        wrote++;
        return JSON.stringify(row) + '\n';
      });
      await fsp.writeFile(ndPath, lines.join(''), 'utf8');
      // Write last upload date
      const now = new Date().toISOString();
      await fsp.writeFile(lastUploadPath, now, 'utf8');
      lastUploadCache = now;
      return res.json({ saved: wrote });
    } catch (e) {
      console.error('[api/upload] exception:', e);
      return res.status(500).json({ error: 'Failed to save data on server: ' + e.message });
    }
  }

  console.error('[api/upload] invalid upload payload:', payload);
  return res.status(400).json({ error: 'Expected JSON body with an array of rows (data).' });
});

// Multipart CSV upload streaming endpoint (handles very large files)
app.post('/api/upload-multipart', requireApiKey, (req, res) => {
  const bb = new Busboy({ headers: req.headers });
  const ndPath = path.join(__dirname, 'data.ndjson');
  const tmpPath = path.join(__dirname, 'upload.tmp.ndjson');
  const outStream = fs.createWriteStream(tmpPath, { encoding: 'utf8' });
  let saved = 0;
  let errored = false;

  bb.on('file', (name, fileStream, info) => {
    // pipe CSV through csv-parser into ndjson file
    fileStream.pipe(csvParser())
      .on('data', (row) => {
        outStream.write(JSON.stringify(row) + '\n');
        saved += 1;
      })
      .on('error', (err) => {
        errored = true;
        fileStream.unpipe();
        outStream.end();
      })
      .on('end', () => {
        // finished parsing file
      });
  });

  bb.on('finish', async () => {
    outStream.end(async () => {
      if (errored) return res.status(500).json({ error: 'Failed to parse upload' });
      // replace data.ndjson atomically
      try {
        await fsp.rename(tmpPath, ndPath);
      } catch (e) {
        return res.status(500).json({ error: 'Failed to move uploaded file' });
      }
      // Write last upload date
      const now = new Date().toISOString();
      try {
        await fsp.writeFile(lastUploadPath, now, 'utf8');
        lastUploadCache = now;
      } catch (e) {}
      return res.json({ saved });
    });
  });

  req.pipe(bb);
});

// Clear persisted server data (remove data.ndjson and data.json)
app.post('/api/clear', requireApiKey, async (req, res) => {
  try {
    const ndPath = path.join(__dirname, 'data.ndjson');
    const jsonPath = path.join(__dirname, 'data.json');
    try { await fsp.unlink(ndPath); } catch (e) {}
    try { await fsp.unlink(jsonPath); } catch (e) {}
    // touch an empty ndjson file to represent cleared state
    try { await fsp.writeFile(ndPath, '', 'utf8'); } catch (e) {}
    return res.json({ cleared: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to clear server data' });
  }
});


app.get('/', (req, res) => res.json({ message: 'API server is running' }));

// 404 handler for API - return JSON
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  next();
});

// generic error handler - return JSON
app.use((err, req, res, next) => {
  const status = err && err.status ? err.status : 500;
  if (status === 500) {
    // Always log stack for 500 errors
    console.error('[server] 500 error:', err && err.stack || err);
  } else if (process.env.NODE_ENV === 'development') {
    console.error('[server] error', err && err.stack || err);
  }
  res.status(status).json({
    error: err && err.message ? err.message : 'Internal Server Error',
    ...(status === 500 && err && err.stack ? { stack: err.stack } : {})
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API server listening on http://localhost:${port}`));