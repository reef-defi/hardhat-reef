import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { ContractFactory } from "ethers";
import type { ethers } from "ethers";
import { HttpNetworkConfig } from "hardhat/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { TypedDataDomain, TypedDataField, TypedDataSigner } from '@ethersproject/abstract-signer';
import { Bytes } from '@ethersproject/bytes';
import { Deferrable } from '@ethersproject/properties';
import { Provider, Signer } from "@reef-defi/evm-provider";

export const REEF_CHAIN = "reef";
export const TESTNET_REEF = "testnet_reef";

export interface ProxyProvider {
  getContractFactory: (contract: string) => Promise<ContractFactory>;
  // getSigner(): Promise<ReefSigner>;
  // getSigners(): Promise<ReefSigner[]>;
}

export interface ReefNetworkConfig extends HttpNetworkConfig {
  path?: string;
}

// Signer proxy interface between Polkadot Signer and Ehter Signer
// interface ReefSigner  {
//   getAddress: () => Promise<string>;
//   signMessage: (message: string | Bytes) => Promise<string>;
//   signTransaction: (transaction: Deferrable<TransactionRequest>) => Promise<string>;
//   sendTransaction: (transaction: Deferrable<TransactionRequest>) => Promise<TransactionResponse>;
//   connect: (provider: ProxyProvider) => SignerWithAddress;
//   toJSON: () => void;
// }

export type HardhatEthers = typeof ethers & HardhatEthersHelpers;
