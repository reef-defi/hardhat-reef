import { Keyring, WsProvider } from "@polkadot/api";
import { createTestPairs } from "@polkadot/keyring/testingPairs";
import { KeyringPair } from "@polkadot/keyring/types";
import {
  Provider,
  Signer,
  TestAccountSigningKey,
} from "@reef-defi/evm-provider";
import axios from "axios";
import { Contract, ContractFactory } from "ethers";
import {
  TASK_COMPILE_SOLIDITY_GET_DEPENDENCY_GRAPH,
  TASK_COMPILE_SOLIDITY_GET_SOURCE_NAMES,
  TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS,
} from "hardhat/builtin-tasks/task-names";
import {
  getSolidityFilesCachePath,
  SolidityFilesCache,
} from "hardhat/builtin-tasks/utils/solidity-files-cache";
import taskTypes, { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  CustomVerificationArguments,
  ProxyProvider,
  ReefNetworkConfig,
} from "../types";
import {
  availableCompilerVersions,
  compress,
  ensureExpression,
  throwError,
  wait,
} from "../utils";

import { ProxySigner } from "./signers/ProxySigner";

interface Signers {
  [name: string]: Signer;
}

export default class ReefProxy implements ProxyProvider {
  private static provider: Provider | undefined;
  private static wallets: { [name: string]: ProxySigner } = {};

  private providerUrl: string;
  private scanUrl?: string;
  private hre: HardhatRuntimeEnvironment;
  private seeds: { [key: string]: string };

  constructor(hre: HardhatRuntimeEnvironment) {
    const config = hre.network.config as ReefNetworkConfig;
    console.log(`Listening on: ${config.url}`);
    this.hre = hre;
    this.providerUrl = config.url;
    this.seeds = config.seeds ? config.seeds : {};
    this.scanUrl = config.scanUrl;
  }

  public async getContractAt(
    nameOrAbi: string | any[],
    address: string,
    signer?: ProxySigner
  ): Promise<Contract> {
    let artifact: any[];

    if (typeof nameOrAbi === "string") {
      const art = await this.hre.artifacts.readArtifact(nameOrAbi);
      artifact = art.abi;
    } else {
      artifact = nameOrAbi;
    }

    return new Contract(address, artifact, signer as Signer);
  }

  public async getContractFactory(
    contractName: string,
    signer?: ProxySigner | string
  ) {
    await this.ensureSetup();
    const wallet = await this.resolveSigner(signer);
    const contract = await this.hre.artifacts.readArtifact(contractName);
    return ContractFactory.fromSolidity(contract).connect(wallet as Signer);
  }

  public async getSigners() {
    await this.ensureSetup();
    return this.getWallets();
  }

  public async getProvider() {
    await this.ensureProvider();
    return ReefProxy.provider!;
  }

  public async getSigner(address: string) {
    await this.ensureSetup();
    const wallets = await this.getWallets();
    const addresses = await Promise.all(
      wallets.map(async (wallet) => wallet.getAddress())
    );
    const walletIndex = addresses.findIndex((addr) => addr === address);

    ensureExpression(
      walletIndex !== -1,
      `Signer with address: ${address} was not found!`
    );
    return wallets[walletIndex];
  }

  public async getSignerByName(name: string) {
    await this.ensureSetup();
    if (!(name in ReefProxy.wallets)) {
      throwError("Signer does not exist!");
    }
    return ReefProxy.wallets[name];
  }
  public async verifyContract(
    address: string,
    name: string,
    args: any[],
    customArgs?: Partial<CustomVerificationArguments>
  ) {
    if (!this.scanUrl) {
      console.warn(
        "Verification was skipped. Verification URL is missing in config"
      );
      return;
    }

    const sourcePaths: string[] = await this.hre.run(
      TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS
    );

    const sourceNames: string[] = await this.hre.run(
      TASK_COMPILE_SOLIDITY_GET_SOURCE_NAMES,
      {
        sourcePaths,
      }
    );

    const solidityFilesCachePath = getSolidityFilesCachePath(
      this.hre.config.paths
    );
    const solidityFilesCache = await SolidityFilesCache.readFromFile(
      solidityFilesCachePath
    );

    const dependencyGraph: taskTypes.DependencyGraph = await this.hre.run(
      TASK_COMPILE_SOLIDITY_GET_DEPENDENCY_GRAPH,
      { sourceNames, solidityFilesCache }
    );

    const contractFile = dependencyGraph
      .getResolvedFiles()
      .find(
        (file) =>
          file.content.rawContent.match(new RegExp(`contract ${name}\\s.*`)) ||
          file.content.rawContent.match(new RegExp(`contract ${name}{`))
      );

    if (!contractFile) {
      throw new Error("Contract was not found and can not be verified!");
    }

    const dependencies = resolveContractDependencies(
      contractFile,
      dependencyGraph
    );
    const source = dependencies.reduce(
      (prev, current) => ({
        ...prev,
        [current.sourceName]: current.content.rawContent,
      }),
      { [contractFile.sourceName]: contractFile.content.rawContent }
    );

    const compiler = this.hre.config.solidity.compilers[0];

    const foundCompilerVersion = availableCompilerVersions.find((version) =>
      version.includes(compiler.version)
    );

    if (!foundCompilerVersion && !customArgs?.compilerVersion) {
      throw new Error("Compiler version was not found");
    }
    const body = {
      name,
      address,
      source: JSON.stringify(source),
      arguments: JSON.stringify(args),
      filename: contractFile.sourceName,
      runs: customArgs?.runs || compiler.settings.optimizer.runs || 200,
      compilerVersion: customArgs?.compilerVersion || foundCompilerVersion,
      target: customArgs?.target || compiler.settings.evmVersion || "london",
      optimization: `${
        customArgs?.optimization || compiler.settings.optimizer.enabled || false
      }`,
      license: this.extractLicense(source[contractFile.sourceName]),
    };

    await waitUntilContractExists(this.scanUrl, address);

    await axios
      .post(`${this.scanUrl}/api/verificator/submit-verification`, body)
      .then((r) => {
        console.log(`Contract ${name} verified!`);
      })
      .catch((err) => {
        console.log(`Contract ${name} was not verified!`);
        console.log(err.message);
      });
  }

  private extractLicense(
    contract: string,
    licenseIndicator = "SPDX-License-Identifier"
  ): string {
    if (!contract.includes(licenseIndicator)) {
      return "";
    }
    return contract
      .split("\n")
      .find((line) => line.includes(licenseIndicator))!
      .split(licenseIndicator)[1];
  }

  private async getWallets(): Promise<ProxySigner[]> {
    return Object.entries(ReefProxy.wallets).map(([, value]) => value);
  }

  private async resolveSigner(
    signer?: ProxySigner | string
  ): Promise<ProxySigner> {
    await this.ensureSetup();
    if (signer === undefined) {
      return ReefProxy.wallets.alice;
    }
    if (typeof signer === "string") {
      return this.getSigner(signer);
    }
    return signer;
  }

  private async ensureSetup() {
    await this.ensureProvider();
    await this.ensureWallets();
  }

  private async ensureProvider() {
    if (!ReefProxy.provider) {
      ReefProxy.provider = new Provider({
        provider: new WsProvider(this.providerUrl),
      });
    }
    await ReefProxy.provider.api.isReady;
  }

  private async ensureWallets() {
    const wallets = await this.getWallets();
    if (wallets.length === 0) {
      await this.ensureProvider();

      const testPairs = createTestPairs();
      const signingKeys = new TestAccountSigningKey(
        ReefProxy.provider!.api.registry
      );
      signingKeys.addKeyringPair(Object.values(testPairs));

      const seedPairs = Object.keys(this.seeds).map((key) => ({
        name: key,
        pair: createSeedKeyringPair(this.seeds[key]),
      }));

      signingKeys.addKeyringPair(seedPairs.map(({ pair }) => pair));

      const seedSigners: Signers = seedPairs.reduce(
        (acc: Signers, { name, pair }) => {
          acc[name] = new Signer(
            ReefProxy.provider!,
            pair.address,
            signingKeys
          );
          return acc;
        },
        {}
      );

      const testSignersByName: Signers = [
        "alice",
        "bob",
        "charlie",
        "dave",
        "eve",
        "ferdie",
      ].reduce((acc: Signers, name) => {
        acc[name] = new Signer(
          ReefProxy.provider!,
          testPairs[name].address,
          signingKeys
        );
        return acc;
      }, {});

      ReefProxy.wallets = { ...seedSigners, ...testSignersByName };
    }
  }
}

const createSeedKeyringPair = (seed: string): KeyringPair => {
  const keyring = new Keyring({ type: "sr25519" });
  return keyring.addFromUri(seed);
};

const resolveContractDependencies = (
  file: taskTypes.ResolvedFile,
  dependencyGraph: taskTypes.DependencyGraph
): taskTypes.ResolvedFile[] =>
  compress(
    dependencyGraph
      .getDependencies(file)
      .map((innerDep) => [
        innerDep,
        ...resolveContractDependencies(innerDep, dependencyGraph),
      ])
  );

const doesContractExist = async (
  url: string,
  address: string
): Promise<boolean> =>
  axios
    .get(`${url}/api/contract/${address}`)
    .then((_) => true)
    .catch((_) => false);

// Complete await cicle is in pattern: 1+2+3+...+steps.
// Execution time = steps*(steps+1) / 2 s;
// I.E. Steps = 20; Execution time = 380s
const waitUntilContractExists = async (
  url: string,
  address: string,
  steps = 20
): Promise<void> => {
  let delayLength = 1000;
  for (let i = 0; i < steps; i++) {
    await wait(delayLength);
    const res = await doesContractExist(url, address);
    if (res) {
      return;
    }
    delayLength += 1000;
  }
  throw new Error("Contract was not detected");
};
