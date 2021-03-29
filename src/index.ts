import "@nomiclabs/hardhat-ethers";
import { TASK_RUN } from "hardhat/builtin-tasks/task-names";
import { extendConfig, extendEnvironment, task } from "hardhat/config";
import { runScriptWithHardhat } from "hardhat/internal/util/scripts-runner";
import { HardhatPluginError, lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types/config";
import path from "path";

import { startChain, stopChain } from "./chain-runner/chain-runner";
import { proxyBuilder } from "./proxy-builder";
import "./type-extensions";
import { defaultReefNetworkConfig, ensureFilePath } from "./utils";

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
    const reefNetworkConfig = userReefNetwork
      ? userReefNetwork
      : defaultReefNetworkConfig();

    config.networks.reef = reefNetworkConfig;
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
  hre.reef = lazyObject(() => proxyBuilder(hre.config.defaultNetwork, hre));
});

task(TASK_RUN, "Run script on Reef chain")
  .setAction(
    async (
      { script }: { script: string; },
      { run, hardhatArguments, config }
    ) => {
      try {
        await run("compile");
        await ensureFilePath(script);
        await startChain(run, config);
        // TODO running provider.setup() does not work... Find out why!
        // await reef.setup();
        await runScriptWithHardhat(hardhatArguments, script);
        await stopChain(run, config);
      } catch (error) {
        throw new HardhatPluginError("Reef-chain-provider", error.message);
      }
    }
  );
