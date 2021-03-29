import { Provider, Signer, TestAccountSigningKey } from "@acala-network/bodhi";
import { Keyring, WsProvider } from "@polkadot/api";
import { createTestPairs } from "@polkadot/keyring/testingPairs";
import { KeyringPair } from "@polkadot/keyring/types";
import { ContractFactory } from "ethers";
import { HardhatPluginError } from "hardhat/internal/core/errors";

import { ProxyProvider, SeedType } from "../types";
import { loadContract } from "../utils";

export class BodhiProxy implements ProxyProvider {
  public provider: Provider | undefined;
  public wallet: Signer | undefined;

  public providerUrl: string;
  public seed: SeedType;

  constructor(url = "ws://127.0.0.1:9944", seed?: SeedType) {
    console.log(`Listening on: ${url}`);
    this.providerUrl = url;
    this.seed = seed;
  }

  public async setup() {
    this.provider = new Provider({
      provider: new WsProvider(this.providerUrl),
    });

    await this.provider.api.isReady;

    const pair = this.createKeyringPair();
    const signingKey = new TestAccountSigningKey(this.provider.api.registry);
    signingKey.addKeyringPair(pair);

    this.wallet = new Signer(this.provider, pair.address, signingKey);
  }

  public async getContractFactory(contractName: string) {
    if (!this.wallet || !this.provider) {
      throw new HardhatPluginError(
        "hardhat-bodhi",
        "Run Chain provider setup!"
      );
    }

    const contract = await loadContract(contractName);
    return ContractFactory.fromSolidity(contract).connect(this.wallet);
  }

  private _createNewKeringPair(): KeyringPair {
    return createTestPairs().alice;
  }

  private _createSeedKeyringPair(seed: string): KeyringPair {
    const keyring = new Keyring({ type: "sr25519" });
    return keyring.addFromUri(seed);
  }

  private createKeyringPair(): KeyringPair {
    return this.seed
      ? this._createSeedKeyringPair(this.seed)
      : this._createNewKeringPair();
  }
}
