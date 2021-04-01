import { ethers } from "ethers";
import { ReefSigner } from "./ReefSigner";

export class EthersSigner extends ethers.Signer implements ReefSigner {
  public static async create(signer: ethers.providers.JsonRpcSigner) {
    return new EthersSigner(await signer.getAddress(), signer);
  }

  private constructor(
    public readonly address: string,
    private readonly _signer: ethers.providers.JsonRpcSigner
  ) {
    super();
    (this as any).provider = _signer.provider;
  }

  public async getAddress(): Promise<string> {
    return this.address;
  }

  public signMessage(message: string | ethers.utils.Bytes): Promise<string> {
    return this._signer.signMessage(message);
  }

  public signTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>
  ): Promise<string> {
    return this._signer.signTransaction(transaction);
  }

  public sendTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>
  ): Promise<ethers.providers.TransactionResponse> {
    return this._signer.sendTransaction(transaction);
  }

  public connect(provider: ethers.providers.Provider): EthersSigner {
    return new EthersSigner(this.address, this._signer.connect(provider));
  }

  public _signTypedData(
    ...params: Parameters<ethers.providers.JsonRpcSigner["_signTypedData"]>
  ): Promise<string> {
    return this._signer._signTypedData(...params);
  }

  public toJSON() {
    return `<SignerWithAddress ${this.address}>`;
  }
}