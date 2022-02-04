# Hardhat Reef plugin

Hardhat reef plugin allows to deploy and interact with contracts through hardhat and reef.js.

## Installation

```
yarn add @reef-defi/hardhat-reef 
```

## Configuration

Reef network can be configured in `hardhat.config.js` file. 

Here is an example of a configuration for both localhost `reef-node` and `reef-testnet`.
To inject your account insert account mnemonic in `<INSERT ACCOUNT MNEMONIC SEED>` field and then access it through `await hre.reef.getSignerByName("Account1");`.

```javascript
module.exports = {
  solidity: "0.8.4",
  networks: {
    // Mainnet reef network configuration
    reef_mainnet: {
      url: "wss://rpc.reefscan.com/ws",
      scanUrl: "https://reefscan.com"
      seeds: {
        "MyAccount1": "<INSERT ACCOUNT MNEMONIC SEED>",
      }
    },
    // Testnet reef network configuration
    reef_testnet: {
      url: "wss://rpc-testnet.reefscan.com/ws",
      scanUrl: "https://reefscan.com"
      seeds: {
        "MyAccount1": "<INSERT ACCOUNT MNEMONIC SEED>",
      }
    },
    // Localhost reef network configuration
    reef: {
      url: "ws://127.0.0.1:9944",
      scanUrl: "http://localhost:3000"
      seeds: {
        "MyAccount1": "<INSERT ACCOUNT MNEMONIC SEED>",
      }
    },
  },
};
```

Each network configuration accepts 
- `url`: used to connect to the desired network.
- `seeds`: used to injecting a real account in the script. The default value is set to `{}`.

Default values for both networks are set with the URLs shown in the example.
This way system works straight out of the box without the need for configuration.
Therefore configuration is only required if the user wants to change the URL of a network or if he wants to inject his accounts.


## Usage

The plugin exposes `hre.reef` object for interaction with the reef compatible chain.
See [examples repo](https://github.com/reef-defi/hardhat-reef-examples) for examples of usage.


### Signers

#### Claiming EVM account

Make sure to claim the EVM account before making any other EVM calls:

```ts
const myAccount = await hre.reef.getSignerByName("myAccount");
await myAccount.claimDefaultAccount();
```
This has to be done only once, multiple calls however won't change anything.

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


## Test, Deploy & Interaction with contract example

In this example we will show how to create a new project, test, deploy and interact with the contract.
We will use [Hardhat Reef Template](https://github.com/reef-defi/hardhat-reef-template). 
The template provides us with a Greeter contract, some scripts, all necessary dependencies, and hardhat configurations for the Reef node.



### Creating new project

There are two simple ways to start new project. 

1. Clone [Hardhat Reef Template](https://github.com/reef-defi/hardhat-reef-template).
```bash
git clone git@github.com:reef-defi/hardhat-reef-template.git greeter
cd greeter
yarn
```

2. Use [Hardhat Reef Template](https://github.com/reef-defi/hardhat-reef-template) to configure new project on Github and then clone it.
```bash
git clone git@github.com:/username/greeter.git
cd greeter
yarn
```


### Configure project
First, we need to configure our account from the Reef testnet.
Injected account will be used to deploy the contract on the chain. 
This can easily be done in `hardhat.config.js` file by replacing `<INSERT ACCOUNT MNEMONIC SEED>` with account mnemonic seed.

**Make sure account hold suffitient amount of reef tokens!**

If you are going to use the localhost chain, run it by hand and transfer some funds from `alice` test account.

```javascript
module.exports = {
  solidity: "0.8.0",
  networks: {
    reef_mainnet: {
      url: "wss://rpc.reefscan.com/ws",
      seeds: {
        "MyAccount": "<INSERT ACCOUNT MNEMONIC SEED>"
      }
    },
    reef_testnet: {
      url: "wss://rpc-testnet.reefscan.com/ws",
      seeds: {
        "MyAccount": "<INSERT ACCOUNT MNEMONIC SEED>"
      }
    },
    reef: {
      url: "ws://127.0.0.1:9944",
      seeds: {
        "MyAccount": "<INSERT ACCOUNT MNEMONIC SEED>"
      }
    },
  },
};
```

### Contract
All the contracts must be written under `contracts/` folder.

### Testing contract

Contract truffle tests are located under `test/` folder. 
All the tests will be run on hardhat network!

Running tests: `yarn hardhat test`

### Deploy contract

To deploy a contract we need to write a script `scripts/deploy.js`. The script will read the Greeter contract and deploy it with an injected account.

```javascript
const hre = require("hardhat");

async function main() {
  // accessing injected account
  const signer = await hre.reef.getSignerByName("MyAccount");
  // retreaving Greeter contract factory with injected account 
  const Greeter = await hre.reef.getContractFactory("Greeter", signer);
  // deploying the contract with inital "Hello world"
  const greeter = await Greeter.deploy("Hello world");
  // waiting for the contract to be deployed
  await greeter.deployed();
  
  // Make sure to print out the contract address and save it!
  console.log(`Greeter contract address: ${greeter.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

**Save the contract address after the script is finished!**

Run deployment script on the Local reef network: `yarn hardhat run script/deploy.js`.

Run deployment script on the Reef test network: `yarn hardhat run script/deploy.js --network reef_testnet`.

Run deployment script on the Hardhat network: `yarn hardhat run script/deploy.js --network hardhat`.

### Contract interaction

We will create a new script `scirpts/interact.js` to interact with the Greeter contract.
The script will retrieve the Greeter contract from the chain, read its current greeting value, change the greeting text, and read it again.

```javascript
const hre = require("hardhat");

async function main() {
  // copy the Greeter contract address from deployment script
  const contractAddress = "INSERT CONTRACT ADDRESS";
  // accessing injected account
  const signer = await hre.reef.getSignerByName("MyAccount");
  // retrieve Greeter contract from chain
  const greeter = await hre.reef.getContractAt("Greeter", contractAddress, signer);

  // now we can access existing contract values
  console.log("Current greeter text: ", await greeter.greet());
  // modify it
  await greeter.setGreeting("Greetings!");
  // and view it again
  console.log("New greeter text: ", await greeter.greet());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

Run interaction script for the Local reet network: `yarn hardhat run script/interact.js`.

Run interaction script for the Reef test network: `yarn hardhat run script/interact.js --network reef_testnet`.


### Contract verification

Hardhat reef also supports verifying contract from the Reef chain!
Here is a basic example of contract deploymant and verification combined:

```javascript
const hre = require("hardhat");

const wait = async (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  const signer = await hre.reef.getSignerByName("Acc");
  const ERC20Contract = await hre.reef.getContractFactory("ERC20Contract", signer);
  const args = ["180000000000000000000000000000000000"];
  const erc20CContract = await ERC20Contract.deploy(...args);
  await erc20CContract.deployed();

  await hre.reef.verifyContract(erc20CContract.address, "ERC20Contract", args);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

#### Custom compiler arguments

If your project uses multiple compiler versions it will be necessary to specify compiler versions to verify the contract.
Users can therefore specify partial compiler config containing:
- compilerVersion: specific [compiler version](https://etherscan.io/solcversions) in format `v0.8.4+commit.c7e474f2`
- optimization: boolean flag that indicates if contracts were optimized
- runs: specific number of runs that were used when contract was compiled
- target: specific [compiler target](https://docs.soliditylang.org/en/v0.8.11/using-the-compiler.html#target-options) ['london', 'berlin', ...]

Here is one example how to use it. We will create the same contract as before, but here we will specify all compiler options.

```javascript
const hre = require("hardhat");

const wait = async (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  const signer = await hre.reef.getSignerByName("Acc");
  const ERC20Contract = await hre.reef.getContractFactory("ERC20Contract", signer);
  const args = ["180000000000000000000000000000000000"];
  const erc20CContract = await ERC20Contract.deploy(...args);
  await erc20CContract.deployed();

  await hre.reef.verifyContract(
    erc20CContract.address, 
    "ERC20Contract",
    args,
    {
      runs: 200, // We are still placing runs event tho optimization is set to false
      target: 'london', // Default target version
      optimization: false, // We are not using contract optimization
      compilerVersion: "v0.8.4+commit.c7e474f2", // Examples project uses 0.8.4 solidity compiler version
    }
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

# Developement

## Testing

Running `yarn test` will run every test located in the `test/` folder. They
use [mocha](https://mochajs.org) and [chai](https://www.chaijs.com/).

We recommend creating unit tests for your own modules, and integration tests for
the interaction of the plugin with Hardhat and its dependencies.

### Hardhat project structure test
In folder `test/fixture-projects/hardhat-project` there is an example project, which can be used to test deployment on the real network. Use the command:
```
npx hardhat run scripts/deploy.js --network reef
```

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

## CI versioning
Versioning is done with the GH action: https://github.com/mikeal/merge-release.

Based on the commit messages, the version will be incremented from the latest release:

- If the string "BREAKING CHANGE" is found anywhere in any of the commit messages or descriptions the major version will be incremented.
- If a commit message begins with the string "feat" then the minor version will be increased. This works for most common commit metadata for feature additions: "feat: new API" and "feature: new API".
- All other changes will increment the patch version.
