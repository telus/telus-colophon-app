# Colophon

[![License][license-image]][license-url] [![version][npm-image]][npm-url] [![Build Status][circle-image]][circle-url]

> Standarized project metadata to specify the components, constructs and authorship of software

## Install

```shell
npm install @colophon/app
```

## Usage

### 1. Database

Colophon requires a PostgreSQL database, the [database schema](./db/db.sql) will automatically be applied when using the supplied [Dockerfile](./db/Docekrfile).

However, this is not recommended for production deployemnts. Please use an appropriately managed/scaled database server.

### 2. Environment Variables

Set up the required environment variables, this can be done in your shell environment or using a `.env` file:

```shell
# Domain where this service lives
PROJECT_DOMAIN=localhost:3000

# GitHub App Info
APP_ID=22615
APP_SLUG=colophon-dev
CLIENT_ID=xxxxx
CLIENT_SECRET=xxxx
PRIVATE_KEY_PATH=./key.pem

# Use `trace` to get verbose logging or `info` to show less
LOG_LEVEL=info

# Cookie Session secret
SESSION_SECRET=xxxxx

# Database config
POSTGRES_DB=probot
POSTGRES_USER=probot
POSTGRES_PASSWORD=probot
```

### 3. Launch

#### a) Docker & Docker Compose

```shell
$ docker-compose up
```

#### b) Node

```shell
$ cd app
$ npm start
```

### 4. Development Mode

#### a) Docker & Docker Compose

Create a `docker-compose.override.yml` file in your project root:

```yaml
version: '3.2'

services:
  db:
    env_file: .env
    ports: ['5432:5432']

  server:
    env_file: .env
    command: dev
    volumes:
      - './app:/src'
```

```shell
$ docker-compose up
```

#### b) Node

```shell
$ cd app
$ npm run dev
```

---
> Website: [colophon.id](https://colophon.id) &bull; 
> Github: [@Project-Colophon](https://github.com/project-colophon) &bull; 
> Twitter: [@ColophonID](https://twitter.com/ColophonID)

[license-url]: LICENSE
[license-image]: https://img.shields.io/github/license/project-colophon/colophon.svg?style=for-the-badge&logo=circleci

[circle-url]: https://circleci.com/gh/project-colophon/colophon
[circle-image]: https://img.shields.io/circleci/project/github/project-colophon/colophon/master.svg?style=for-the-badge&logo=circleci

[npm-url]: https://www.npmjs.com/package/@colophon/app
[npm-image]: https://img.shields.io/npm/v/@colophon/app.svg?style=for-the-badge&logo=npm
