import { HardhatPluginError } from "hardhat/plugins";
import { HardhatConfig, RunTaskFunction } from "hardhat/types";
import { URL } from "url";
import { REEF_CHAIN } from "../types";
import { ensureExpression } from "../utils";
import ReefChainService from "./ReefChainService";

export const startChain = async (
  run: RunTaskFunction,
  chain: string,
  config: HardhatConfig,
) => {
  if (chain === REEF_CHAIN) {
    let url = new URL(config.networks.reef.url);
    const free = await isPortFree(url.hostname, Number(url.port));

    if (config.networks.reef.path) {
      ensureExpression(free, "Port 9944 is already bound!");
      return await ReefChainService.createService(config.networks.reef.path);
    } else {
      ensureExpression(!free, `Cannot connect to ${url}.`);
      return Promise.resolve();
    }
  } else {
    return Promise.resolve();
  }
};

export const stopChain = async () => {
  return await ReefChainService.stopService();
}

const isPortFree = async (host: string, port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    var portscanner = require('portscanner');
    portscanner.checkPortStatus(port, host, (error: any, status: string) => {
      // Status is 'open' if currently in use or 'closed' if available
      resolve(status === "closed");
    });
  })
}
