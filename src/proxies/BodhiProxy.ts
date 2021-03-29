import { TestAccountSigningKey, Provider, Signer } from "@acala-network/bodhi";
import { WsProvider, Keyring } from "@polkadot/api";
import { createTestPairs } from "@polkadot/keyring/testingPairs";
import { KeyringPair } from "@polkadot/keyring/types";
import { ContractFactory } from "ethers";
import { HardhatPluginError } from "hardhat/internal/core/errors";
import { ProxyProvider } from "../types";
import { ensureFilePath } from "../utils";

export class BodhiProxy implements ProxyProvider {

  provider: Provider | undefined;
  wallet: Signer | undefined;

  WS_URL = process.env.WS_URL || "ws://127.0.0.1:9944";
  seed = process.env.SEED;


  public async setup() {
    this.provider = new Provider({
      provider: new WsProvider(this.WS_URL),
    });

    await this.provider.api.isReady;
    
    let pair: KeyringPair;
    if (this.seed) {
      const keyring = new Keyring({ type: "sr25519" });
      pair = keyring.addFromUri(this.seed);
    } else {
      const testPairs = createTestPairs();
      pair = testPairs.alice;
    }

    const signingKey = new TestAccountSigningKey(this.provider.api.registry);
    signingKey.addKeyringPair(pair);

    this.wallet = new Signer(this.provider, pair.address, signingKey);
  }

  public async getContractFactory(contractName: string) {
    if (!this.wallet || !this.provider) {
      throw new HardhatPluginError("hardhat-bodhi", "Run Chain provider setup!");
    }
    const contractFile = `${process.cwd()}/artifacts/contracts/${contractName}.sol/${contractName}.json`;
    await ensureFilePath(contractFile);
    const contract = await require(contractFile);
    
    const contractFactory = await ContractFactory
      .fromSolidity(contract)
      .connect(this.wallet);

    return contractFactory;
  }
}
