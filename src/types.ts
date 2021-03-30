import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { ContractFactory } from "ethers";
import type { ethers } from "ethers";
import { HttpNetworkConfig } from "hardhat/types";

export const REEF_CHAIN = "reef";

export interface ProxyProvider {
  getContractFactory: (contract: string) => Promise<ContractFactory>;
}

export interface ReefNetworkConfig extends HttpNetworkConfig {
  path: string;
  seed?: string;
}

export type SeedType = string | undefined;
export type HardhatEthers = typeof ethers & HardhatEthersHelpers;
