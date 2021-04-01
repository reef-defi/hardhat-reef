import { Provider, Signer, TestAccountSigningKey, SigningKey } from "@acala-network/bodhi";
import { Keyring, WsProvider } from "@polkadot/api";
import { createTestPairs } from "@polkadot/keyring/testingPairs";
import { KeyringPair } from "@polkadot/keyring/types";
import { ContractFactory } from "ethers";
import { HardhatPluginError } from "hardhat/plugins";

import { ProxyProvider, ReefNetworkConfig } from "../types";
import {  accountsToArrayOfStrings, loadContract } from "../utils";
import { ReefSigner } from "./signers/ReefSigner";

export class BodhiProxy implements ProxyProvider {
  private static provider: Provider | undefined;
  private static wallets: Signer[] = [];

  private providerUrl: string;
  private seeds: string[];

  constructor(config: ReefNetworkConfig) {
    console.log(`Listening on: ${config.url}`);
    this.providerUrl = config.url;
    this.seeds = accountsToArrayOfStrings(config.accounts);
  }

  public async getContractFactory(contractName: string, signer?: ReefSigner | string) {
    await this.ensureSetup();
    const wallet = await this.resolveSigner(signer);
    const contract = await loadContract(contractName);
    return ContractFactory.fromSolidity(contract).connect(wallet as Signer);
  }

  public async getSigners() {
    await this.ensureSetup();
    return BodhiProxy.wallets;
  }

  public async getSigner(address: string) {
    await this.ensureSetup();
    const addresses = await Promise.all(
      BodhiProxy.wallets.map(async (wallet) => await wallet.getAddress())
    );
    const walletIndex = addresses
      .findIndex((addr) => addr === address);

    if (walletIndex === -1) {
      throw new HardhatPluginError("Hardhat-reef", `Signer with address: ${addresses[walletIndex]} not found!`)
    }
    return BodhiProxy.wallets[walletIndex];
  }

  private async resolveSigner(signer?: ReefSigner | string): Promise<ReefSigner> {
    await this.ensureSetup();
    if (signer === undefined)
      return BodhiProxy.wallets[0];
    if (typeof signer === "string")
      return this.getSigner(signer);
    return signer;
  }

  private async ensureSetup() {
    await this.ensureProvider()
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
    if (BodhiProxy.wallets.length == 0) {
      await this.ensureProvider();

      const testPairs = createTestPairs();
      const signingKeys = new TestAccountSigningKey(BodhiProxy.provider!.api.registry);
      signingKeys.addKeyringPair(Object.values(testPairs));

      const seedPairs = this.seeds
        .map((seed) => createSeedKeyringPair(seed));

      signingKeys.addKeyringPair(seedPairs);

      const seedSigners = seedPairs
        .map((pair) => new Signer(BodhiProxy.provider!, pair.address, signingKeys));    

      BodhiProxy.wallets = [...seedSigners,
        new Signer(BodhiProxy.provider!, testPairs.alice.address, signingKeys),
        new Signer(BodhiProxy.provider!, testPairs.bob.address, signingKeys),
        new Signer(BodhiProxy.provider!, testPairs.charlie.address, signingKeys),
        new Signer(BodhiProxy.provider!, testPairs.dave.address, signingKeys),
        new Signer(BodhiProxy.provider!, testPairs.eve.address, signingKeys),
        new Signer(BodhiProxy.provider!, testPairs.ferdie.address, signingKeys),
      ]
    }
  }
}

const createSeedKeyringPair = (seed: string): KeyringPair => {
  const keyring = new Keyring({ type: "sr25519" });
  return keyring.addFromUri(seed);
}
