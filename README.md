# Hardhat Reef plugin

Hardhat reef plugin allows to deploy and interact with contracts through hardhat and bodhi.js.

## Installation

```
yarn add @reef-defi/hardhat-reef 
```

## Usage

The plugin exposes `hre.reef` object for interaction with the bodhi compatible chain.
See [examples repo](https://github.com/reef-defi/hardhat-reef-examples) for examples of usage.


### Signers

Get signers all signers.
```javascript
const signers = await hre.reef.getSigners();
const [signer1] = await hre.reef.getSigners();
```

Get signer with address.
```javascript
const address = "0x0000" // Address needs to be changed
const singer = await hre.reef.getSigner(address);
```

Access signers address and find it again.
```javascript
const [signer1] = await hre.reef.getSigners();
const address = await signer1.getAddress();
const previousSigner = await hre.reef.getSigner(address);

console.log(address === await previousSigner.getAddress());
```

Because each chain has different addresses, we introduce get signer by name method.
Available names: `[alice, bob, charlie, dave, eve, ferdie]`.
```javascript
const signer = await hre.reef.getSignerByName("alice");
```

### Contracts

Creating contract factory.
```javascript
const flipper = await hre.reef.getContractFactory("Flipper");
```

Creating contract factory with arguments.
```javascript
const flipper = await hre.reef.getContractFactory("Flipper", [true]);
```

Creating contract factory with explicit signer.
```javascript
const alice = await hre.reef.getSignerByName("alice");
const flipper = await hre.reef.getContractFactory("Flipper", [], alice);
```

Finding flipper contract through his address.
```javascript
const flipper = await hre.reef.getContractFactory("Flipper", [], alice);
const address = await flipper.address;
const contract = await hre.reef.getContractAt("Flipper", address);
```


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

## Development

To start working on your project, run

```bash
yarn build
```

then include the plugin in your `hardhat` repo with `yarn link`.
