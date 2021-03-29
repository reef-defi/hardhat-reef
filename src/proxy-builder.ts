import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

import { BodhiProxy } from "./proxies/BodhiProxy";
import EthersProxy from "./proxies/EthersProxy";
import { ProxyProvider, REEF_CHAIN } from "./types";

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
    default:
      return new EthersProxy(hre.ethers);
  }
};
