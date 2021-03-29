import { HardhatPluginError } from "hardhat/plugins";
import { HardhatConfig, RunTaskFunction } from "hardhat/types";

import { GANATCH_CHAIN, REEF_CHAIN } from "../types";

export const startChain = async (
  run: RunTaskFunction,
  config: HardhatConfig
) => {
  switch (config.defaultNetwork) {
    case REEF_CHAIN:
      return run("start-reef-chain", { chain: config.networks.reef.path });
    case GANATCH_CHAIN:
      return Promise.resolve();
    default:
      throw new HardhatPluginError("Chain provider", "Unknow chain");
  }
};

export const stopChain = async (
  run: RunTaskFunction,
  config: HardhatConfig
) => {
  switch (config.defaultNetwork) {
    case REEF_CHAIN:
      return run("stop-reef-chain", { chain: config.networks.reef.path });
    case GANATCH_CHAIN:
      return Promise.resolve();
    default:
      throw new HardhatPluginError("Chain provider", "Unknow chain");
  }
};
