import { Bytes } from '@ethersproject/bytes';
import { Deferrable } from '@ethersproject/properties';
import { BigNumber } from "@ethersproject/bignumber";
import { BlockTag, TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';

export declare class ReefSigner {
  getAddress(): Promise<string>;
  signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string>;
  sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse>;
  signMessage(message: Bytes | string): Promise<string>;

  getBalance(blockTag?: BlockTag): Promise<BigNumber>;
  getTransactionCount(blockTag?: BlockTag): Promise<number>;
  estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber>;
  call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag): Promise<string>;
  sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse>;
  getChainId(): Promise<number>;
  getGasPrice(): Promise<BigNumber>;
  resolveName(name: string): Promise<string>;
  checkTransaction(transaction: Deferrable<TransactionRequest>): Deferrable<TransactionRequest>;
  populateTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionRequest>;

  _checkProvider(operation?: string): void;
  
  static isSigner(value: any): value is ReefSigner;
}
