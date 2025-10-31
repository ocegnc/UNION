require('dotenv').config();

const { Pool } = require('pg');

// /C:/Users/oce_g/VSCode/backend/db.js
'use strict';


const pool = new Pool(
    process.env.DATABASE_URL
        ? {
                connectionString: process.env.DATABASE_URL,
                ssl:
                    process.env.PGSSLMODE === 'require' || process.env.NODE_ENV === 'production'
                        ? { rejectUnauthorized: false }
                        : false,
            }
        : {
                user: process.env.DB_USER,
                host: process.env.DB_HOST,
                database: process.env.DB_DATABASE,
                password: process.env.DB_PASSWORD,
                port: process.env.DB_PORT,
                max: parseInt(process.env.PGPOOL_MAX, 10) || 10,
                idleTimeoutMillis: parseInt(process.env.PGIDLE_MS, 10) || 30000,
            }
);

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    // optional: process.exit(-1);
});

/**
 * Run a query using the pool.
 * Usage: const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
 */
async function query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // console.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
}

module.exports = { pool, query };

