import { TestAccountSigningKey, Provider, Signer } from "@acala-network/bodhi";
import { WsProvider, Keyring } from "@polkadot/api";
import { createTestPairs } from "@polkadot/keyring/testingPairs";
import { KeyringPair } from "@polkadot/keyring/types";

export class Bodhi {
  WS_URL = process.env.WS_URL || "ws://127.0.0.1:9944";
  seed = process.env.SEED;

  public async setup() {
    const provider = new Provider({
      provider: new WsProvider(this.WS_URL),
    });

    await provider.api.isReady;

    let pair: KeyringPair;
    if (this.seed) {
      const keyring = new Keyring({ type: "sr25519" });
      pair = keyring.addFromUri(this.seed);
    } else {
      const testPairs = createTestPairs();
      pair = testPairs.alice;
    }

    const signingKey = new TestAccountSigningKey(provider.api.registry);
    signingKey.addKeyringPair(pair);

    const wallet = new Signer(provider, pair.address, signingKey);
    return {
      wallet,
      provider,
    };
  }
}
