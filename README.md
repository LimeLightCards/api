
# Limelight API

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Setting Up Authentication

We use Firebase for authentication. To set that up, [sign in here](https://console.firebase.google.com/u/0/) and create a new project. Afterwards, go to the Settings area of the project, then Project Settings. You should be in the General tab, but if not, switch over to it. In here, Project ID is what you will need for `FIREBASE_PROJECT_ID` (see `Environment Variables`).

You will also need to make a service account. To do so, go to the Service accounts tab, and hit `Generate new private key`. This will give you a JSON file that you need for `FIREBASE_SERVICE_ACCOUNT_JSON` (see `Environment Variables`), but it will need to be slightly transformed first. The JSON needs to be minified (all newlines removed), and that can be done for example with a tool like [JSON minifier](https://codebeautify.org/jsonminifier) (although, a more secure alternative is preferred).

## Environment Variables

The following values are required:

* `FIREBASE_PROJECT_ID` - see Setting Up Authentication
* `FIREBASE_SERVICE_ACCOUNT_JSON` - see Setting Up Authentication

The following values are optional:

* `MONGODB_URI` - defaults to `mongodb://localhost:27017/limelight`

## Running the app

```bash
# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```