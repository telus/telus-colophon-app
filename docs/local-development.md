# Local Development

This guide will describe how to set up Colophon for local development.

### 1. Preliminary setup

While Colophon can be used to scan the repositories for a personal or organization account, using an organization account is more representative of our use case.

Go to Github and create an organization to use for test purposes.  It will also be necessary for this organization to have some repositories to scan, so create several of those as well.

### 2. Set up database

Colophon uses a PostgreSQL database as a backend.  If necessary, follow the proper process for your operating system to install PostgreSQL.

Once you have a running instance of PostgreSQL, set it up for Colophon.

First, run these commands as the `postgres` user:

```
$ createuser -P -h localhost -d -R -e colophon
$ createdb -O colophon colophon
```

Note that you will be prompted for a password, take note of it for future steps.

Then, from the repository root run these comands under your regular user account:

```
$ psql -U colophon -h localhost -p 5432 colophon < ./database/app.sql
$ psql -U colophon -h localhost -p 5432 colophon < ./database/sessions.sql
```

You will be prompted to enter the same password you used to create the `colophon` PostgreSQL account.

### 3. Set up ngrok

[ngrok](https://ngrok.com/) is an application that exposes servers running on your local machine to the public internet over secure tunnels, and is needed so that Github can communicate with your locally-running instance of Colophon.

[Download](https://ngrok.com/download) it, and run it on port `3000`:

`ngrok http 3000`

You'll get a screen in your terminal displaying ngrok's status:

![ngrok status](./assets/ngrok.png)

### 4. Set up Github app

### 5. Set up environment

### 6. Run app

- set up test github org & repos
- clone repo
- set up database
  - install postgres
  - as root
    - `su - postgres`
    - `createuser -P -h localhost -d -R -e colophon`
      - enter password
    - `createdb -O colophon colophon`
  - as regular user
    - `psql -U colophon -h localhost -p 5432 colophon < database/app.sql`
    - `psql -U colophon -h localhost -p 5432 colophon < database/sessions.sql`
- set up ngrok
  - https://ngrok.com/
  - `ngrok http 3000`
    - take note of https address
- set up github app
- set up environment
  - use .env file to `export` env vars
    - `GITHUB_APP_ID`
    - `GITHUB_CLIENT_ID`
    - `GITHUB_CLIENT_SECRET`
    - `GITHUB_APP_LINK`
    - `GITHUB_PRIVATE_KEY_PATH`
    - `GITHUB_WEBHOOK_SECRET`
      - generate
    - `COLOPHON_LINK`
      - from ngrok
    - `COLOPHON_SESSION_SECRET`
      - generate
    - `POSTGRES_HOST`
    - `POSTGRES_PORT`
    - `POSTGRES_DB`
    - `POSTGRES_USER`
    - `POSTGRES_PASSWORD`
- run app
  - `source .env`
  - `npm run dev`
- visit at ngrok https url:3000
