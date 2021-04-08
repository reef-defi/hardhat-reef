import { HardhatPluginError } from "hardhat/plugins";
import { HardhatConfig, RunTaskFunction } from "hardhat/types";
import { URL } from "url";

import { REEF_CHAIN } from "../types";
import { ensureExpression } from "../utils";

import ReefChainService from "./ReefChainService";

export const startChain = async (chain: string, config: HardhatConfig) => {
  if (chain === REEF_CHAIN) {
    const url = new URL(config.networks.reef.url);
    const free = await isPortFree(url.hostname, Number(url.port));
    ensureExpression(free, "Port 9944 is already bound!");
    return ReefChainService.createService();
  } else {
    return Promise.resolve();
  }
};

export const stopChain = async () => {
  return ReefChainService.stopService();
};

const isPortFree = async (host: string, port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const portscanner = require("portscanner");
    portscanner.checkPortStatus(port, host, (error: any, status: string) => {
      // Status is 'open' if currently in use or 'closed' if available
      resolve(status === "closed");
    });
  });
};
