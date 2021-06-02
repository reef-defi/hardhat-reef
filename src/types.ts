import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { Provider } from "@reef-defi/evm-provider";
import { Contract, ContractFactory } from "ethers";
import type { ethers } from "ethers";
import { HttpNetworkConfig } from "hardhat/types";

import { ReefSigner } from "./proxies/signers/ReefSigner";

export const REEF_CHAIN = "reef";
export const TESTNET_REEF = "reef_testnet";
export const MAINNET_REEF = "reef_mainnet";

export interface ProxyProvider {
  getContractAt: (
    nameOrAbi: string | any[],
    address: string,
    signer?: ReefSigner
  ) => Promise<Contract>;
  getContractFactory: (
    contract: string,
    signer?: ReefSigner | string
  ) => Promise<ContractFactory>;

  getSigner(address: string): Promise<ReefSigner>;
  getSigners(): Promise<ReefSigner[]>;
  getSignerByName(name: string): Promise<ReefSigner>;

  getProvider(): Promise<Provider>;
}

export interface ReefNetworkConfig extends HttpNetworkConfig {
  path?: string;
  seeds?: { [key: string]: string };
}

export type HardhatEthers = typeof ethers & HardhatEthersHelpers;
