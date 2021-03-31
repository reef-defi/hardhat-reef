import { HardhatPluginError } from "hardhat/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

import { BodhiProxy } from "./proxies/BodhiProxy";
import EthersProxy from "./proxies/EthersProxy";
import { ProxyProvider, REEF_CHAIN, TESTNET_REEF } from "./types";

export const proxyBuilder = (
  chain: string,
  hre: HardhatRuntimeEnvironment
): ProxyProvider => {

  const chainConfig = hre.config.networks;
  
  switch(chain) {
    case REEF_CHAIN: 
      return new BodhiProxy(
        chainConfig.reef.url, 
        accountsToArrayOfStrings(chainConfig.reef.accounts)
      );
    case TESTNET_REEF:
      return new BodhiProxy(
        chainConfig.testnet_reef.url, 
        accountsToArrayOfStrings(chainConfig.testnet_reef.accounts)
      );
    default:
      return new EthersProxy(hre.ethers);
  }

};

const accountsToArrayOfStrings = (accounts: any): string[] => {
  if (Array.isArray(accounts) && accounts.every(item => typeof item === "string")) {
    return accounts as string[];
  } else {
    throw new HardhatPluginError("Hardhat-reef", "Reef chain allows only account of type: string[]");
  }
}
