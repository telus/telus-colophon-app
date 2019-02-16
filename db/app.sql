-- trigger to update timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- repositories table
CREATE TABLE repositories (
  id VARCHAR PRIMARY KEY,
  installation VARCHAR,
  org VARCHAR,
  name VARCHAR,
  url VARCHAR,
  language VARCHAR,
  private BOOL NOT NULL DEFAULT TRUE,
  filename VARCHAR,
  updated TIMESTAMP NOT NULL DEFAULT NOW(),
  content TEXT,
  colophon jsonb
);

-- automatically update timestamp
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON repositories
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- installations table
CREATE TABLE installations (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  type VARCHAR,
  url VARCHAR,
  installed TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE VIEW orgs AS
  SELECT
    installation as id,
    MAX(updated) AS updated,
    COALESCE(SUM(1), 0) AS total,
    COALESCE(SUM(1) FILTER (WHERE colophon IS NOT NULL), 0) AS available
    FROM repositories
    GROUP BY installation
;
