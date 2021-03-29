import "./type-extensions";
import "@nomiclabs/hardhat-ethers";

import path from "path";
import { proxyBuilder } from "./proxy-builder";
import { GANATCH_CHAIN, REEF_CHAIN } from "./types";
import { HardhatConfig } from "hardhat/types/config";
import { HardhatUserConfig } from "hardhat/types/config";
import { TASK_RUN } from "hardhat/builtin-tasks/task-names";
import { HardhatPluginError, lazyObject } from "hardhat/plugins";
import { defaultReefNetworkConfig, ensureFilePath } from "./utils";
import { startChain, stopChain } from "./chain-runner/chain-runner";
import { extendEnvironment, task, extendConfig } from "hardhat/config";
import { runScriptWithHardhat } from "hardhat/internal/util/scripts-runner";


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
extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
  const userReefNetwork = userConfig.networks!["reef"];
  const reefNetworkConfig = userReefNetwork
    ? userReefNetwork
    : defaultReefNetworkConfig();

  config.networks.reef = reefNetworkConfig;
});

// Configure selected running network
extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
  const userNetworkName = userConfig.networkName 
    ? userConfig.networkName 
    : "reef";

  config.networkName = userNetworkName;
});

// Extend proxyBuilder on reef object
extendEnvironment((hre) => {
  hre.reef = lazyObject(() => 
    proxyBuilder(hre.config.networkName, hre));
});


task(TASK_RUN, "Run script on Reef chain")
  .addOptionalParam("chain", `Run script on desired chain: ${REEF_CHAIN}, ${GANATCH_CHAIN}`, REEF_CHAIN)
  .addOptionalParam("chainPath", "Path to the chain", "./../reef/reef-chain/")
  .setAction( async (
    { script, chain, chainPath }: { script: string, chain: string, chainPath: string }, 
    { run, hardhatArguments }) => {
      try {
        await run("compile");
        await ensureFilePath(script);
        await startChain(chain, chainPath, run);
        // TODO running provider.setup() does not work... Find out why!
        // await reef.setup();
        await runScriptWithHardhat(hardhatArguments, script)
        await stopChain(chain, chainPath, run);
      } catch (error) {
        throw new HardhatPluginError("Reef-chain-provider", error.message);
      }
  });
