import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { Contract, ContractFactory } from "ethers";
import type { ethers } from "ethers";
import { HttpNetworkConfig } from "hardhat/types";

export interface ProxyProvider {
  setup: () => Promise<void>;
  getContractFactory: (contract: string) => Promise<ContractFactory>;
}

export interface ReefNetworkConfig extends HttpNetworkConfig {
  path: string;
  seed?: string;
}

export type HardhatEthers = typeof ethers & HardhatEthersHelpers;

export const REEF_CHAIN = "reef";
export const GANATCH_CHAIN = "eth";
export type Chain = typeof REEF_CHAIN | typeof GANATCH_CHAIN;

export type SeedType = string | undefined;
