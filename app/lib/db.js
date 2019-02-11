const Pool = require('pg').Pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD
})

// TODO: optimize for multiple inserts
exports.upsert = (installation, repo) => {
  const [org, name] = repo.full_name.split('/')

  const row = [
    installation,
    repo.id,
    org,
    name,
    repo.private,
    repo.filename,
    repo.content,
    repo.colophon
  ]

  return pool.query(`INSERT INTO
    repositories (installation, id, org, name, private, filename, content, colophon)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE
    SET org = EXCLUDED.org,
    name = EXCLUDED.name,
    private = EXCLUDED.private,
    filename = EXCLUDED.filename,
    content = EXCLUDED.content,
    colophon = EXCLUDED.colophon
    `, row)
}

exports.list = org => {
  return pool.query(`SELECT * FROM repositories WHERE org = $1`, [org])
}

exports.count = () => {
  return pool.query(`SELECT
    installation,
    sum(1) AS total,
    sum(1) FILTER (WHERE colophon IS NOT NULL) AS available
    FROM repositories GROUP BY installation`)
}

exports.get = (org, name) => {
  return pool.query(`SELECT * FROM repositories WHERE org = $1 AND name = $2`, [org, name])
}

exports.remove = (installation, id) => {
  return pool.query(`DELETE FROM repositories WHERE installation = $1 AND id = $2`, [installation, id])
}

exports.uninstall = (installation) => {
  return pool.query(`DELETE FROM repositories WHERE installation = $1`, [installation])
}
