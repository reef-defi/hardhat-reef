# Hardhat Reef plugin

Hardhat reef plugin allows to deploy and interact with contracts through hardhat and bodhi.js.

## Installation

```
yarn add @reef-defi/hardhat-reef 
```

## Configuration

Reef network can be configured in `hardhat.config.js` file. 

Here is an example of a configuration for both localhost reef-node and reef-testnet.
To access your account insert account mnemonic in `<INSERT ACCOUNT MNEMONIC SEED>` field and then access it through `await hre.reef.getSignerByName("Account1");`.

```javascript
module.exports = {
  solidity: "0.8.0",
  networks: {
    // Localhost reef network configuration
    reef: {
      url: "ws://127.0.0.1:9944",
      seeds: {
        "Account1": "<INSERT ACCOUNT MNEMONIC SEED>",
      }
    },
    // Testnet reef network configuration
    reef_testnet: {
      url: "wss://rpc-testnet.reefscan.com/ws",
      seeds: {
        "Account1": "<INSERT ACCOUNT MNEMONIC SEED>",
      }
    },
  },
};
```

Each network configuration accepts 
- `url`: used to connect to the desired network.
- `seeds`: used to injecting a real account in the script. The default value is set to `{}`.

Default values for both networks are set with the URL shown in the example.
This way system works straight out of the box without the need for configuration.
Therefore configuration is only required if the user wants to change the URL of a network or if he wants to inject his accounts.


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

Get signer by name.
Available localhost test signers: `[alice, bob, charlie, dave, eve, ferdie]`.
```javascript
const signer = await hre.reef.getSignerByName("alice");
```

Access injected account from configuration.
```javascript
const signer = await hre.reef.gerSignerByName("Account name used in config file");
```


### Contracts

Creating contract factory.
```javascript
const Flipper = await hre.reef.getContractFactory("Flipper");
```

Creating contract factory with arguments.
```javascript
const Flipper = await hre.reef.getContractFactory("Flipper");
const flipper = await Flipper.deploy(false);
```

Creating contract factory with explicit signer.
```javascript
const alice = await hre.reef.getSignerByName("alice");
const Flipper = await hre.reef.getContractFactory("Flipper", alice);
const flipper = await Flipper.deploy(true);
```

Finding flipper contract through his address.
```javascript
const Flipper = await hre.reef.getContractFactory("Flipper", alice);
const flipper = await Flipper.deploy(false);
const address = await flipper.address;
const contract = await hre.reef.getContractAt(Flipper, address);
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
