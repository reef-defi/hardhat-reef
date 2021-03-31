import { HardhatConfig, RunTaskFunction } from "hardhat/types";
import { REEF_CHAIN } from "../types";

export const startChain = async (
  run: RunTaskFunction,
  chain: string,
  config: HardhatConfig,
) => {
  const free = await isPortFree(config.networks.reef.url);

  if (chain === REEF_CHAIN && free) {
    return run("start-reef-chain", { chain: config.networks.reef.path });
  } else {
    return Promise.resolve();
  }
};

const isPortFree = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    var portscanner = require('portscanner');
    portscanner.checkPortStatus(9944, '127.0.0.1', (error: any, status: string) => {
      // Status is 'open' if currently in use or 'closed' if available
      resolve(status === "closed");
    });
  })
}
