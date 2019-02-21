# ![Colophon](https://github.com/project-colophon/brand/blob/master/logo.svg)

[![License][license-image]][license-url] [![version][npm-image]][npm-url] [![Build Status][circle-image]][circle-url]

> Standarized project metadata to specify the components, constructs and authorship of software

## Usage

#### 1. install the app using `npm`

```shell
$ npm install --global @colophon/app
```

##### 2. Database

Colophon requires a PostgreSQL database instance, you can find the database initialization scheams under the [`database` folder](./database/)

#### 3. GitHub App

Follow the [App Setup instructions](./docs/app.md) to create a GitHub App.

##### 4. Environment Configuration

Follow the [Environment Setup instructions](./docs/environment.md) to configure your Colophon environment

##### 5. Launch

```shell
$ colophon
```

---
> Website: [colophon.id](https://colophon.id) &bull; 
> Github: [@project-colophon](https://github.com/project-colophon) &bull; 
> Twitter: [@ColophonID](https://twitter.com/ColophonID)

[license-url]: LICENSE
[license-image]: https://img.shields.io/github/license/project-colophon/app.svg?style=for-the-badge&logo=circleci

[circle-url]: https://circleci.com/gh/project-colophon/workflows/app
[circle-image]: https://img.shields.io/circleci/project/github/project-colophon/app/master.svg?style=for-the-badge&logo=circleci

[npm-url]: https://www.npmjs.com/package/@colophon/app
[npm-image]: https://img.shields.io/npm/v/@colophon/app.svg?style=for-the-badge&logo=npm
