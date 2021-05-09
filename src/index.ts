import "@nomiclabs/hardhat-ethers";
import { extendConfig, extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types/config";
import path from "path";

import "./built-in/run";
import { proxyBuilder } from "./proxy-builder";
// import "./built-in/test";
import "./type-extensions";
import { defaultReefNetworkConfig, defaultReefTestnetConfig } from "./utils";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const userPath = userConfig.paths?.newPath;

    let newPath: string;
    if (userPath === undefined) {
      newPath = path.join(config.paths.root, "newPath");
    } else {
      if (path.isAbsolute(userPath)) {
        newPath = userPath;
      } else {
        newPath = path.normalize(path.join(config.paths.root, userPath));
      }
    }
    config.paths.newPath = newPath;
  }
);

// Configure Reef Network Parameters
extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const userReefNetwork = userConfig.networks?.reef;

    config.networks.reef = {
      ...defaultReefNetworkConfig(),
      ...userReefNetwork,
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
