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
  seeds: {},
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
  scanUrl: "https://testnet.reefscan.com",
});

export const defaultReefMainnetConfig = (): ReefNetworkConfig => ({
  ...defaultReefNetworkConfig(),
  url: "wss://rpc.reefscan.com/ws",
  scanUrl: "https://reefscan.com",
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

export const wait = async (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

export const compress = <T>(values: T[][]): T[] => {
  const newValues: T[] = [];
  for (const value of values) {
    for (const innerValue of value) {
      newValues.push(innerValue);
    }
  }

  return newValues;
};

export const availableCompilerVersions = [
  "v0.8.10+commit.fc410830",
  "v0.8.9+commit.e5eed63a",
  "v0.8.8+commit.dddeac2f",
  "v0.8.7+commit.e28d00a7",
  "v0.8.6+commit.11564f7e",
  "v0.8.5+commit.a4f2e591",
  "v0.8.4+commit.c7e474f2",
  "v0.8.3+commit.8d00100c",
  "v0.8.2+commit.661d1103",
  "v0.8.1+commit.df193b15",
  "v0.8.0+commit.c7dfd78e",
  "v0.7.6+commit.7338295f",
  "v0.7.5+commit.eb77ed08",
  "v0.7.4+commit.3f05b770",
  "v0.7.3+commit.9bfce1f6",
  "v0.7.2+commit.51b20bc0",
  "v0.7.1+commit.f4a555be",
  "v0.7.0+commit.9e61f92b",
  "v0.6.12+commit.27d51765",
  "v0.6.11+commit.5ef660b1",
  "v0.6.10+commit.00c0fcaf",
  "v0.6.9+commit.3e3065ac",
  "v0.6.8+commit.0bbfe453",
  "v0.6.7+commit.b8d736ae",
  "v0.6.6+commit.6c089d02",
  "v0.6.5+commit.f956cc89",
  "v0.6.4+commit.1dca32f3",
  "v0.6.3+commit.8dda9521",
  "v0.6.2+commit.bacdbe57",
  "v0.6.1+commit.e6f7d5a4",
  "v0.6.0+commit.26b70077",
];
