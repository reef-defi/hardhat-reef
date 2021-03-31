import { HardhatConfig, RunTaskFunction } from "hardhat/types";

import { REEF_CHAIN } from "../types";

export const startChain = async (
  run: RunTaskFunction,
  config: HardhatConfig
) => {
  switch (config.defaultNetwork) {
    case REEF_CHAIN:
      return run("start-reef-chain", { chain: config.networks.reef.path });
    default:
      return Promise.resolve();
  }
};

export const stopChain = async (
  run: RunTaskFunction,
  config: HardhatConfig
) => {
  switch (config.defaultNetwork) {
    case REEF_CHAIN:
      return run("stop-reef-chain", { chain: config.networks.reef.path });
    default:
      return Promise.resolve();
  }
};
