import { HardhatPluginError } from "hardhat/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

import { BodhiProxy } from "./proxies/BodhiProxy";
import EthersProxy from "./proxies/EthersProxy";
import { GANATCH_CHAIN, ProxyProvider, REEF_CHAIN } from "./types";

export const proxyBuilder = (
  chain: string,
  hre: HardhatRuntimeEnvironment
): ProxyProvider => {
  switch (chain) {
    case REEF_CHAIN:
      return new BodhiProxy(
        hre.config.networks.reef.url,
        hre.config.networks.reef.seed
      );
    case GANATCH_CHAIN:
      return new EthersProxy(hre.ethers);
    default:
      throw new HardhatPluginError(
        "Reef-provider",
        `Unknown chain! Avaliable: [${REEF_CHAIN}, ${GANATCH_CHAIN}]`
      );
  }
};
