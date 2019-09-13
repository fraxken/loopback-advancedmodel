# Loopback-advancedmodel
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/fraxken/loopback-advancedmodel/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/fraxken/loopback-advancedmodel/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![dep](https://img.shields.io/david/fraxken/loopback-advancedmodel)
![size](https://img.shields.io/bundlephobia/min/loopback-advancedmodel)
[![Known Vulnerabilities](https://snyk.io//test/github/fraxken/loopback-advancedmodel/badge.svg?targetFile=package.json)](https://snyk.io//test/github/fraxken/loopback-advancedmodel?targetFile=package.json)

Improved model component for Loopback version 3.x

## Features

- Async & Await support
- Register multiple validators on one property at once.
- Better generic errors handler.
- Object-oriented descriptor for OpenAPI (Swagger 2.0).
- Basic ACLs management support

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i loopback-advancedmodel
# or
$ yarn add loopback-advancedmodel
``` 

## Usage example
Setup your loopback project as usual and then start writing a new model (for example User).

Require the advancedmodel `class` from the package and use it as follow :

```javascript
const advancedmodel = require('loopback-advancedmodel');

// Create your User Model
const User = new advancedmodel().disableAllMethods();

async function sayHello() {
    return "hello world!";
}
// Register the Asynchronous method sayHello on User model and Get the OpenAPI Descriptor Object.
const OpenAPIDescriptor = User.registerRemoteMethod(sayHello);

// Setup classical OpenAPI informations about our REST Endpoint.
OpenAPIDescriptor.get('/sayHello').returns({ type: 'string' });

// Export the User model
module.exports = User.export();
``` 

## API
Find all documentation on the wiki section right [here](https://github.com/fraxken/loopback-advancedmodel/wiki)

## License
MIT
