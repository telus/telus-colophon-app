# ![Colophon](https://github.com/project-colophon/brand/blob/master/logo.svg)

[![License][license-image]][license-url] [![version][npm-image]][npm-url]

> Standarized project metadata to specify the components, constructs and authorship of software

## Usage

#### 1. install the app using `npm`

```shell
$ npm install --global @telus/colophon-app
```

##### 2. Database

Colophon requires a PostgreSQL database instance, you can find the database initialization schemas under the [`database` folder](./database/)

#### 3. GitHub App

Follow the [App Setup instructions](./docs/app.md) to create a GitHub App.

##### 4. Environment Configuration

Follow the [Environment Setup instructions](./docs/environment.md) to configure your Colophon environment

##### 5. Launch

```shell
$ colophon
```

---
> Website: [colophon.id](https://colophon.telus.digital) &bull;
> Github: [@telus Colophon](https://github.com/telus/telus-colophon-app) &bull;

[license-url]: LICENSE
[license-image]: https://img.shields.io/github/license/telus/telus-colophon-app/app.svg?style=for-the-badge&logo=circleci

[npm-url]: https://www.npmjs.com/package/@telus/telus-colophon-app
[npm-image]: https://img.shields.io/npm/v/@telus/telus-colophon-app.svg?style=for-the-badge&logo=npm
