import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { Provider } from "@reef-defi/evm-provider";
import type { Contract, ContractFactory, ethers } from "ethers";
import { HttpNetworkConfig } from "hardhat/types";

import { ProxySigner } from "./proxies/signers/ProxySigner";

export const REEF_CHAIN = "reef";
export const TESTNET_REEF = "reef_testnet";
export const MAINNET_REEF = "reef_mainnet";

export interface CustomVerificationArguments {
  runs: number;
  target: string;
  optimization: boolean;
  compilerVersion: string;
}

export interface ProxyProvider {
  getContractAt: (
    nameOrAbi: string | any[],
    address: string,
    signer?: ProxySigner
  ) => Promise<Contract>;
  getContractFactory: (
    contract: string,
    signer?: ProxySigner | string
  ) => Promise<ContractFactory>;

  getSigner(address: string): Promise<ProxySigner>;
  getSigners(): Promise<ProxySigner[]>;
  getSignerByName(name: string): Promise<ProxySigner>;

  getProvider(): Promise<Provider>;

  verifyContract(
    address: string,
    name: string,
    args: any[],
    customArgs?: Partial<CustomVerificationArguments>
  ): Promise<void>;
}

export interface ReefNetworkConfig extends HttpNetworkConfig {
  path?: string;
  scanUrl?: string;
  seeds?: { [key: string]: string };
}

export type HardhatEthers = typeof ethers & HardhatEthersHelpers;
