-- trigger to update timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- repositories table
CREATE TABLE IF NOT EXISTS repositories (id VARCHAR PRIMARY KEY);

ALTER TABLE repositories ADD COLUMN IF NOT EXISTS installation VARCHAR;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS org VARCHAR;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS name VARCHAR;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS url VARCHAR;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS language VARCHAR;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS private BOOL NOT NULL DEFAULT TRUE;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS filename VARCHAR;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS updated TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS colophon jsonb;

-- trigger to automatically update timestamp
DROP TRIGGER IF EXISTS set_timestamp ON repositories;

CREATE TRIGGER set_timestamp BEFORE UPDATE ON repositories
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- installations table
CREATE TABLE installations (id VARCHAR PRIMARY KEY);
ALTER TABLE installations ADD COLUMN IF NOT EXISTS name VARCHAR;
ALTER TABLE installations ADD COLUMN IF NOT EXISTS type VARCHAR;
ALTER TABLE installations ADD COLUMN IF NOT EXISTS url VARCHAR;
ALTER TABLE installations ADD COLUMN IF NOT EXISTS installed TIMESTAMP NOT NULL DEFAULT NOW();

CREATE OR REPLACE VIEW orgs AS
  SELECT
    installation as id,
    MAX(updated) AS updated,
    COALESCE(SUM(1), 0) AS total,
    COALESCE(SUM(1) FILTER (WHERE colophon IS NOT NULL), 0) AS available
    FROM repositories
    GROUP BY installation
;
