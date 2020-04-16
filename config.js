require('dotenv').config();

// pg-promise for our database handler
// Which is derived from pg
const Pool = require('pg').Pool;

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

module.exports = pool;