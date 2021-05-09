import { Keyring, WsProvider } from "@polkadot/api";
import { createTestPairs } from "@polkadot/keyring/testingPairs";
import { KeyringPair } from "@polkadot/keyring/types";
import {
  Provider,
  Signer,
  TestAccountSigningKey,
} from "@reef-defi/evm-provider";
import { Contract, ContractFactory } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ProxyProvider, ReefNetworkConfig } from "../types";
import {
  ensureExpression,
  throwError,
} from "../utils";

import { ReefSigner } from "./signers/ReefSigner";

export class BodhiProxy implements ProxyProvider {
  private static provider: Provider | undefined;
  private static wallets: { [name: string]: ReefSigner } = {};

  private hre: HardhatRuntimeEnvironment;
  private providerUrl: string;
  private seeds: string[];

  constructor(hre: HardhatRuntimeEnvironment) {
    const config = hre.network.config as ReefNetworkConfig;
    console.log(`Listening on: ${config.url}`);
    this.hre = hre;
    this.providerUrl = config.url;
    this.seeds = config.seeds ? config.seeds : [];
  }

  public async getContractAt(
    nameOrAbi: string | any[],
    address: string,
    signer?: ReefSigner
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
    signer?: ReefSigner | string
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
    return BodhiProxy.provider!;
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
    if (!(name in BodhiProxy.wallets)) {
      throwError("Signer does not exist!");
    }
    return BodhiProxy.wallets[name];
  }

  private async getWallets(): Promise<ReefSigner[]> {
    return Object.entries(BodhiProxy.wallets).map(([, value]) => value);
  }

  private async resolveSigner(
    signer?: ReefSigner | string
  ): Promise<ReefSigner> {
    await this.ensureSetup();
    if (signer === undefined) {
      return BodhiProxy.wallets.alice;
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
    if (!BodhiProxy.provider) {
      BodhiProxy.provider = new Provider({
        provider: new WsProvider(this.providerUrl),
      });
    }
    await BodhiProxy.provider.api.isReady;
  }

  private async ensureWallets() {
    const wallets = await this.getWallets();
    if (wallets.length === 0) {
      await this.ensureProvider();

      const testPairs = createTestPairs();
      const signingKeys = new TestAccountSigningKey(
        BodhiProxy.provider!.api.registry
      );
      signingKeys.addKeyringPair(Object.values(testPairs));

      const seedPairs = this.seeds.map((seed) => createSeedKeyringPair(seed));

      signingKeys.addKeyringPair(seedPairs);

      const seedSigners = seedPairs.map(
        (pair) => new Signer(BodhiProxy.provider!, pair.address, signingKeys)
      );

      const seedSignerByName = seedSigners.reduce((acc, signer, index) => {
        acc[`Acc-${index + 1}`] = signer;
        return acc;
      }, {} as { [name: string]: ReefSigner });

      const testSignersByName = [
        "alice",
        "bob",
        "charlie",
        "dave",
        "eve",
        "ferdie",
      ].reduce((acc, name) => {
        acc[name] = new Signer(
          BodhiProxy.provider!,
          testPairs[name].address,
          signingKeys
        );
        return acc;
      }, {} as { [name: string]: ReefSigner });

      BodhiProxy.wallets = { ...seedSignerByName, ...testSignersByName };
    }
  }
}

const createSeedKeyringPair = (seed: string): KeyringPair => {
  const keyring = new Keyring({ type: "sr25519" });
  return keyring.addFromUri(seed);
};
