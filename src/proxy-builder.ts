import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

import { BodhiProxy } from "./proxies/BodhiProxy";
import EthersProxy from "./proxies/EthersProxy";
import {
  ProxyProvider,
  REEF_CHAIN,
  ReefNetworkConfig,
  TESTNET_REEF,
} from "./types";

export const proxyBuilder = (hre: HardhatRuntimeEnvironment): ProxyProvider => {
  switch (hre.network.name) {
    case REEF_CHAIN:
      return new BodhiProxy(hre);
    case TESTNET_REEF:
      return new BodhiProxy(hre);
    default:
      return new EthersProxy(hre);
  }
};
