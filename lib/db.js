const { Pool } = require('pg')

const log = require('./log')

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD
})

// shut down on errors
pool.on('error', error => log.exit('Unexpected database error', error))

exports.pool = pool

exports.connect = () => pool.connect()

// TODO: optimize for multiple inserts
exports.upsert = (installation, repo) => {
  const [org, name] = repo.full_name.split('/')

  const row = [
    installation,
    repo.id,
    org,
    name,
    repo.url,
    repo.private,
    repo.filename,
    repo.content,
    repo.colophon
  ]

  return pool.query(`INSERT INTO
    repositories (installation, id, org, name, url, private, filename, content, colophon)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE
    SET org = EXCLUDED.org,
    name = EXCLUDED.name,
    url = EXCLUDED.url,
    private = EXCLUDED.private,
    filename = EXCLUDED.filename,
    content = EXCLUDED.content,
    colophon = EXCLUDED.colophon`, row)
}

exports.list = (org, limit = 25, offset = 0) => {
  return pool.query(`SELECT COUNT(*) OVER() AS total, * FROM repositories WHERE org = $1 LIMIT $2 OFFSET $3`, [org, limit, Math.abs(offset)])
}

exports.installations = (installations) => {
  // cast to strings
  installations = installations.map(String)
  // console.log(installations)
  // return pool.query(`SELECT I.*,
  //   SELECT (MAX(updated) AS updated,
  //   COUNT(id) AS total,
  //   COALESCE(SUM(1) FILTER (WHERE colophon IS NOT NULL), 0) AS available
  //   FROM installations AS I WHERE I.id = ANY ($1)
  //   LEFT JOIN repositories AS R ON R.installation = I.id
  //   GROUP BY I.id`, [installations])

  return pool.query(`SELECT *
    FROM installations
    LEFT JOIN orgs USING (id) `)
}

exports.get = (org, name) => {
  return pool.query(`SELECT * FROM repositories WHERE org = $1 AND name = $2`, [org, name])
}

exports.remove = (installation, id) => {
  return pool.query(`DELETE FROM repositories WHERE installation = $1 AND id = $2`, [installation, id])
}

exports.uninstall = (installation) => {
  pool.query(`DELETE FROM installations WHERE id = $1`, [installation])
  pool.query(`DELETE FROM repositories WHERE installation = $1`, [installation])
}

exports.install = (installation) => {
  const row = [
    installation.id,
    installation.account.login,
    installation.account.type,
    installation.html_url
  ]

  return pool.query(`INSERT INTO
    installations (id, name, type, url)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
    type = EXCLUDED.type,
    url = EXCLUDED.url`, row)
}

exports.installation = (org) => {
  return pool.query(`SELECT * FROM installations WHERE name = $1`, [org])
}
