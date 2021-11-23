import {
  BlockTag,
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { Bytes } from "@ethersproject/bytes";
import { Deferrable } from "@ethersproject/properties";

export declare class ProxySigner {
  public static isSigner(value: any): value is ProxySigner;
  public getAddress(): Promise<string>;

  public signTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<string>;
  public signMessage(message: Bytes | string): Promise<string>;

  public getBalance(blockTag?: BlockTag): Promise<BigNumber>;
  public getTransactionCount(blockTag?: BlockTag): Promise<number>;
  public estimateGas(
    transaction: Deferrable<TransactionRequest>
  ): Promise<BigNumber>;
  public call(
    transaction: Deferrable<TransactionRequest>,
    blockTag?: BlockTag
  ): Promise<string>;
  public sendTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionResponse>;
  public getChainId(): Promise<number>;
  public getGasPrice(): Promise<BigNumber>;
  public resolveName(name: string): Promise<string>;
  public checkTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Deferrable<TransactionRequest>;
  public populateTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionRequest>;

  public _checkProvider(operation?: string): void;
  public claimDefaultAccount(): Promise<void>;
}
