const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || 'db',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432
})

exports.repos = org => {
  return pool.query('SELECT * FROM repos WHERE org = $1 ORDER BY name ASC', [org])
}
