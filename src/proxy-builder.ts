import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

import ReefProxy from "./proxies/ReefProxy";
import EthersProxy from "./proxies/EthersProxy";
import { MAINNET_REEF, ProxyProvider, REEF_CHAIN, TESTNET_REEF } from "./types";

export const proxyBuilder = (hre: HardhatRuntimeEnvironment): ProxyProvider => {
  switch (hre.network.name) {
    case REEF_CHAIN:
      return new ReefProxy(hre, true);
    case TESTNET_REEF:
      return new ReefProxy(hre);
    case MAINNET_REEF:
      return new ReefProxy(hre);
    default:
      return new EthersProxy(hre);
  }
};
