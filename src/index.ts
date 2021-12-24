import "@nomiclabs/hardhat-ethers";
import { extendConfig, extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types/config";

import "./built-in/run";
import { proxyBuilder } from "./proxy-builder";
import "./type-extensions";
import {
  defaultReefMainnetConfig,
  defaultReefNetworkConfig,
  defaultReefTestnetConfig,
} from "./utils";

// Configure Reef Network Parameters
extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    // Reef localhost network config
    config.networks.reef = {
      ...defaultReefNetworkConfig(),
      ...userConfig.networks?.reef,
    };
    // Reef testnet config
    config.networks.reef_testnet = {
      ...defaultReefTestnetConfig(),
      ...userConfig.networks?.reef_testnet,
    };
    // Reef mainnet config
    config.networks.reef_mainnet = {
      ...defaultReefMainnetConfig(),
      ...userConfig.networks?.reef_mainnet,
    };
  }
);

// Configure selected running network
extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const userNetworkName = userConfig.defaultNetwork
      ? userConfig.defaultNetwork
      : "reef";

    config.defaultNetwork = userNetworkName;
  }
);

// Extend proxyBuilder on reef object
extendEnvironment((hre) => {
  hre.reef = lazyObject(() => proxyBuilder(hre));
});
