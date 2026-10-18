// Sync API for Webhjerte Growth: stores the whole dashboard state as one JSON
// document in MySQL (e.g. Aiven). Deployed as a Vercel serverless function.
//
// Env:
//   DATABASE_URL   mysql://user:pass@host:port/db  (Aiven "Service URI")
//   APP_PASSWORD   password the dashboard sends as "Authorization: Bearer …"
//   MYSQL_CA_CERT  optional Aiven CA certificate (PEM) to verify the server

const crypto = require('crypto');
const mysql = require('mysql2/promise');

const DOC_ID = 'main';
const TABLE = 'webhjerte_state';

let poolPromise;
function getPool() {
  if (!poolPromise) {
    poolPromise = (async () => {
      const url = new URL(process.env.DATABASE_URL);
      const ca = process.env.MYSQL_CA_CERT && process.env.MYSQL_CA_CERT.replace(/\\n/g, '\n');
      const pool = mysql.createPool({
        host: url.hostname,
        port: Number(url.port || 3306),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: decodeURIComponent(url.pathname.slice(1)) || 'defaultdb',
        ssl: process.env.MYSQL_SSL === 'off' ? undefined : (ca ? { ca } : { rejectUnauthorized: false }),
        connectionLimit: 2,
        connectTimeout: 10000,
      });
      await pool.query(`CREATE TABLE IF NOT EXISTS ${TABLE} (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        data LONGTEXT NOT NULL,
        version INT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
      return pool;
    })().catch((err) => { poolPromise = undefined; throw err; });
  }
  return poolPromise;
}

function authorized(req) {
  const expected = process.env.APP_PASSWORD || '';
  const header = req.headers.authorization || '';
  const given = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!expected || !given) return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

async function readBody(req) {
  if (req.body !== undefined) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

// Only sent to authorized callers, so the owner can see why MySQL refused the connection.
const errInfo = (err) => ({ code: (err && err.code) || null, message: String((err && err.message) || err).slice(0, 300) });

const toDoc = (row) => (row ? { version: row.version, updatedAt: row.updated_at, data: JSON.parse(row.data) } : { version: 0, updatedAt: null, data: null });

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

  if (!process.env.DATABASE_URL || !process.env.APP_PASSWORD) {
    return send(res, 500, { error: 'not_configured', message: 'Set DATABASE_URL and APP_PASSWORD env vars' });
  }
  if (!authorized(req)) return send(res, 401, { error: 'unauthorized' });

  let pool;
  try { pool = await getPool(); }
  catch (err) { console.error(err); return send(res, 502, { error: 'db_unavailable', ...errInfo(err) }); }

  try {
    if (req.method === 'GET') {
      const [rows] = await pool.query(`SELECT data, version, updated_at FROM ${TABLE} WHERE id = ?`, [DOC_ID]);
      return send(res, 200, toDoc(rows[0]));
    }

    if (req.method === 'PUT') {
      let body;
      try { body = await readBody(req); } catch { return send(res, 400, { error: 'bad_json' }); }
      if (!body || typeof body.data !== 'object' || body.data === null || !Number.isInteger(body.baseVersion)) {
        return send(res, 400, { error: 'bad_request', message: 'Expected { data: object, baseVersion: int }' });
      }
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [rows] = await conn.query(`SELECT data, version, updated_at FROM ${TABLE} WHERE id = ? FOR UPDATE`, [DOC_ID]);
        const current = rows[0];
        const currentVersion = current ? current.version : 0;
        // Optimistic concurrency: another device saved first -> client merges and retries.
        if (currentVersion !== body.baseVersion) {
          await conn.rollback();
          return send(res, 409, { error: 'conflict', ...toDoc(current) });
        }
        const version = currentVersion + 1;
        const json = JSON.stringify(body.data);
        if (current) await conn.query(`UPDATE ${TABLE} SET data = ?, version = ? WHERE id = ?`, [json, version, DOC_ID]);
        else await conn.query(`INSERT INTO ${TABLE} (id, data, version) VALUES (?, ?, ?)`, [DOC_ID, json, version]);
        await conn.commit();
        return send(res, 200, { version });
      } catch (err) {
        await conn.rollback().catch(() => {});
        throw err;
      } finally {
        conn.release();
      }
    }

    res.setHeader('Allow', 'GET, PUT, OPTIONS');
    return send(res, 405, { error: 'method_not_allowed' });
  } catch (err) {
    console.error(err);
    return send(res, 500, { error: 'server_error', ...errInfo(err) });
  }
};
