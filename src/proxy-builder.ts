import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

import { BodhiProxy } from "./proxies/BodhiProxy";
import EthersProxy from "./proxies/EthersProxy";
import { MAINNET_REEF, ProxyProvider, REEF_CHAIN, TESTNET_REEF } from "./types";

export const proxyBuilder = (hre: HardhatRuntimeEnvironment): ProxyProvider => {
  switch (hre.network.name) {
    case REEF_CHAIN:
      return new BodhiProxy(hre, true);
    case TESTNET_REEF:
      return new BodhiProxy(hre);
    case MAINNET_REEF:
      return new BodhiProxy(hre);
    default:
      return new EthersProxy(hre);
  }
};
