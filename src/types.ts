import { ContractFactory, Contract } from "ethers";
import type { ethers } from "ethers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types"

export interface ProxyProvider {
  setup: () => Promise<void>;
  getContractFactory: (contract: string) => Promise<ContractFactory>;  
}

export type HardhatEthers = typeof ethers & HardhatEthersHelpers;

export const REEF_CHAIN = "reef";
export const GANATCH_CHAIN = "eth";
export type Chain = typeof REEF_CHAIN | typeof GANATCH_CHAIN;
