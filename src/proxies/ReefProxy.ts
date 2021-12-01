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
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ProxyProvider, ReefNetworkConfig } from "../types";
import { availableCompilerVersions, ensureExpression, throwError } from "../utils";

// import {getInputFromCompilationJob} from "hardhat/internal/solidity/compiler/compiler-input";

import {
  getSolidityFilesCachePath,
  SolidityFilesCache,
} from "hardhat/builtin-tasks/utils/solidity-files-cache";
import * as taskTypes from "hardhat/types";
import { ProxySigner } from "./signers/ProxySigner";
import {TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS, TASK_COMPILE_SOLIDITY_GET_SOURCE_NAMES, TASK_COMPILE_SOLIDITY_GET_DEPENDENCY_GRAPH} from "hardhat/builtin-tasks/task-names"


export default class ReefProxy implements ProxyProvider {
  private static provider: Provider | undefined;
  private static wallets: { [name: string]: ProxySigner } = {};

  private localhost: boolean;
  private providerUrl: string;
  private verificationUrl?: string;
  private hre: HardhatRuntimeEnvironment;
  private seeds: { [key: string]: string };

  constructor(hre: HardhatRuntimeEnvironment, localhost = false) {
    const config = hre.network.config as ReefNetworkConfig;
    console.log(`Listening on: ${config.url}`);
    this.hre = hre;
    this.providerUrl = config.url;
    this.seeds = config.seeds ? config.seeds : {};
    this.localhost = localhost;
    this.verificationUrl = config.verificationUrl;
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

      const seedSigners = seedPairs.reduce((acc, { name, pair }) => {
        acc[name] = new Signer(ReefProxy.provider!, pair.address, signingKeys);
        return acc;
      }, {} as { [name: string]: Signer });

      const testSignersByName = [
        "alice",
        "bob",
        "charlie",
        "dave",
        "eve",
        "ferdie",
      ].reduce((acc, name) => {
        acc[name] = new Signer(
          ReefProxy.provider!,
          testPairs[name].address,
          signingKeys
        );
        return acc;
      }, {} as { [name: string]: Signer });

      ReefProxy.wallets = { ...seedSigners, ...testSignersByName };
    }
  }

  async verifyContract(address: string, name: string, args: any) {
    if (this.localhost) {
      return;
    }
    if (!this.verificationUrl) {
      console.warn("Verification was skipped. Verification URL is missing in config");
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

    const solidityFilesCachePath = getSolidityFilesCachePath(this.hre.config.paths);
    let solidityFilesCache = await SolidityFilesCache.readFromFile(
      solidityFilesCachePath
    );

    const dependencyGraph: taskTypes.DependencyGraph = await this.hre.run(
      TASK_COMPILE_SOLIDITY_GET_DEPENDENCY_GRAPH,
      { sourceNames, solidityFilesCache }
    );


    const contractFile = dependencyGraph.getResolvedFiles()
      .find((file) => file.content.rawContent.includes(name));

    if (!contractFile) {
      throw new Error("Contract was not found and can not be verified!");
    }

    const dependencies = resolveContractDependencies(contractFile, dependencyGraph);
    const source = dependencies
    .reduce(
      (prev, current) => ({...prev, [current.sourceName]: current.content.rawContent}),
      {[contractFile.sourceName]: contractFile.content.rawContent}
    );
    
    const compiler = this.hre.config.solidity.compilers[0];

    const compilerVersion = availableCompilerVersions.find(
      (version) => version.includes(compiler.version)
    );

    if (!compilerVersion) {
      throw new Error("Compiler version was not found");
    }

    const body = {
      name,
      source: JSON.stringify(source),
      compilerVersion,
      address: address,
      arguments: JSON.stringify(args),
      filename: contractFile.sourceName,
      target: compiler.settings.evmVersion || "london",
      optimization: `${compiler.settings.optimizer.enabled || false}`,
      runs: compiler.settings.optimizer.runs || 200,
    }
    
    await axios
      .post(this.verificationUrl, body)
      .then((r) => {
        console.log(`Contract ${name} verified!`);
      })
      .catch((err) => {
        console.log(`Contract ${name} was not verified!`);
      });
  }
}

const createSeedKeyringPair = (seed: string): KeyringPair => {
  const keyring = new Keyring({ type: "sr25519" });
  return keyring.addFromUri(seed);
};

const resolveContractDependencies = (file: taskTypes.ResolvedFile, dependencyGraph: taskTypes.DependencyGraph): taskTypes.ResolvedFile[] => compress(
   dependencyGraph.getDependencies(file).map((innerDep) => [innerDep, ...resolveContractDependencies(innerDep, dependencyGraph)])
);

export const compress = <T,> (values: T[][]): T[] => {
  let newValues: T[] = [];
  for (const value of values) {
    for (const innerValue of value) {
      newValues.push(innerValue)
    }
  }

  return newValues;
}
  