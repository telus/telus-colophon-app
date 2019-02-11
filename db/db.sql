CREATE TABLE repositories (
  id VARCHAR PRIMARY KEY,
  installation VARCHAR,
  org VARCHAR,
  name VARCHAR,
  private BOOL NOT NULL DEFAULT TRUE,
  filename VARCHAR,
  content TEXT,
  colophon jsonb
);
