import { Provider, Signer, TestAccountSigningKey, SigningKey } from "@acala-network/bodhi";
import { Keyring, WsProvider } from "@polkadot/api";
import { createTestPairs } from "@polkadot/keyring/testingPairs";
import { KeyringPair } from "@polkadot/keyring/types";
import { ContractFactory } from "ethers";
import { HardhatPluginError } from "hardhat/plugins";

import { ProxyProvider } from "../types";
import {  loadContract } from "../utils";
import ReefSigner from "./ReefSigner";

export class BodhiProxy implements ProxyProvider {
  private static provider: Provider | undefined;
  private static wallets: Signer[] = [];

  private providerUrl: string;
  private seeds: string[];

  constructor(url: string, seed: string[]=[]) {
    console.log(`Listening on: ${url}`);
    this.providerUrl = url;
    this.seeds = [...seed];
  }

  public async getContractFactory(contractName: string) {
    await this.ensureSetup();
    const [wallet] = BodhiProxy.wallets;
    const contract = await loadContract(contractName);
    return ContractFactory.fromSolidity(contract).connect(wallet);
  }

  public async getSigner() {
    const [wallet] = BodhiProxy.wallets;
    return wallet;
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
    await BodhiProxy.provider!.api.isReady;
  }

  private async ensureWallets() {
    if (BodhiProxy.wallets.length == 0) {
      await this.ensureProvider();

      const testPairs = createTestPairs();
      const signingKeys = new TestAccountSigningKey(BodhiProxy.provider!.api.registry);
      signingKeys.addKeyringPair(Object.values(testPairs));

      const seedPairs = this.seeds.map((seed) => createSeedKeyringPair(seed));
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
