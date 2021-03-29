import { HardhatPluginError } from "hardhat/plugins";
import { RunTaskFunction } from "hardhat/types";

import { GANATCH_CHAIN, REEF_CHAIN } from "../types";

export const startChain = (
  chain: string,
  chainPath: string,
  run: RunTaskFunction
) => {
  switch (chain) {
    case REEF_CHAIN:
      return run("start-reef-chain", { chain: chainPath });
    case GANATCH_CHAIN:
      return Promise.resolve();
    default:
      throw new HardhatPluginError("Chain provider", "Unknow chain");
  }
};

export const stopChain = (
  chain: string,
  chainPath: string,
  run: RunTaskFunction
) => {
  switch (chain) {
    case REEF_CHAIN:
      return run("stop-reef-chain", { chain: chainPath });
    case GANATCH_CHAIN:
      return Promise.resolve();
    default:
      throw new HardhatPluginError("Chain provider", "Unknow chain");
  }
};
