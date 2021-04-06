import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

import { BodhiProxy } from "./proxies/BodhiProxy";
import EthersProxy from "./proxies/EthersProxy";
import { ProxyProvider, ReefNetworkConfig, REEF_CHAIN, TESTNET_REEF } from "./types";

export const proxyBuilder = (
  hre: HardhatRuntimeEnvironment
): ProxyProvider => {
  const network = hre.network;
  
  

  switch(hre.network.name) {
    case REEF_CHAIN: 
      return new BodhiProxy(network.config as ReefNetworkConfig);
    case TESTNET_REEF:
      return new BodhiProxy(network.config as ReefNetworkConfig);
    default:
      return new EthersProxy(hre.ethers);
  }

};

