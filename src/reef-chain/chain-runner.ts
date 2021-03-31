import { HardhatPluginError } from "hardhat/plugins";
import { HardhatConfig, RunTaskFunction } from "hardhat/types";
import { URL } from "url";
import { REEF_CHAIN } from "../types";

export const startChain = async (
  run: RunTaskFunction,
  chain: string,
  config: HardhatConfig,
) => {
  if (chain === REEF_CHAIN) {
    let url = new URL(config.networks.reef.url);
    const free = await isPortFree(url.hostname, Number(url.port));

    if (config.networks.reef.path) {
      if (!free) {
        throw new HardhatPluginError("hardhat-reef", "Port 9944 is already bound!");
      }
      return run("start-reef-chain", { chain: config.networks.reef.path });
    } else {
      if (free) {
        throw new HardhatPluginError("hardhat-reef", `Cannot connect to ${url}.`);
      }
    }
  } else {
    return Promise.resolve();
  }
};

const isPortFree = async (host: string, port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    var portscanner = require('portscanner');
    portscanner.checkPortStatus(port, host, (error: any, status: string) => {
      // Status is 'open' if currently in use or 'closed' if available
      resolve(status === "closed");
    });
  })
}