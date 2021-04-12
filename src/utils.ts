import fsExtra from "fs-extra";
import { HardhatPluginError } from "hardhat/internal/core/errors";

import { ReefNetworkConfig } from "./types";

export const ensureFilePath = async (filePath: string) => {
  if (!(await fsExtra.pathExists(filePath))) {
    throw new HardhatPluginError(
      "",
      `File on path: ${filePath} does not exist...`
    );
  }
};

export const defaultReefNetworkConfig = (): ReefNetworkConfig => ({
  url: "ws://127.0.0.1:9944",
  path: undefined,
  accounts: [],
  gas: -1,
  gasMultiplier: -1,
  gasPrice: -1,
  httpHeaders: {},
  timeout: -1,
});

export const defaultReefTestnetConfig = (): ReefNetworkConfig => ({
  ...defaultReefNetworkConfig(),
  url: "wss://rpc-testnet.reefscan.com/ws",
});

export const ensureExpression = (
  expression: boolean,
  message: string
): void => {
  if (!expression) {
    throwError(message);
  }
};

export const throwError = (message: string) => {
  throw new HardhatPluginError("Hardhat-reef", message);
};

export const accountsToArrayOfStrings = (accounts: any): string[] => {
  if (
    Array.isArray(accounts) &&
    accounts.every((item) => typeof item === "string")
  ) {
    return accounts as string[];
  } else {
    throw new HardhatPluginError(
      "Hardhat-reef",
      "Reef chain allows only account of type: string[]"
    );
  }
};
