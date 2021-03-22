# Hardhat bodhi plugin

Hardhat bodhi plugin allows to deploy and interact with contracts through hardhat and bodhi.js.

## Installation

To start working on your project, run

```bash
yarn build
```

then include the plugin in your `hardhat` repo, either with `yarn link` or `yarn add`.


## Testing

Running `yarn test` will run every test located in the `test/` folder. They
use [mocha](https://mochajs.org) and [chai](https://www.chaijs.com/).

We recommend creating unit tests for your own modules, and integration tests for
the interaction of the plugin with Hardhat and its dependencies.

## Linting and autoformat

All of Hardhat projects use [prettier](https://prettier.io/) and
[tslint](https://palantir.github.io/tslint/).

You can check if your code style is correct by running `yarn lint`, and fix
it with `yarn lint:fix`.
