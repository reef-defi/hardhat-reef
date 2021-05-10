// If your plugin extends types from another plugin, you should import the plugin here.

// To extend one of Hardhat's types, you need to import the module where it has been defined, and redeclare it.
import "hardhat/types/config";
import "hardhat/types/runtime";

import { ProxyProvider, ReefNetworkConfig } from "./types";

declare module "hardhat/types/config" {
  export interface ProjectPathsUserConfig {
    newPath?: string;
  }
  export interface ProjectPathsConfig {
    newPath: string;
  }
}

declare module "hardhat/types/config" {
  export interface NetworksUserConfig {
    reef?: ReefNetworkConfig;
    reef_testnet?: ReefNetworkConfig;
    reef_mainnet?: ReefNetworkConfig;
  }
  export interface NetworksConfig {
    reef: ReefNetworkConfig;
    reef_testnet: ReefNetworkConfig;
    reef_mainnet: ReefNetworkConfig;
  }
}

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    reef: ProxyProvider;
  }
}
