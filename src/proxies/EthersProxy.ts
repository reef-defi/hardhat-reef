import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";
import { Artifact } from "hardhat/types";

import { HardhatEthers, ProxyProvider } from "../types";
import { loadContract } from "../utils";
import { ReefSigner } from "./signers/ReefSigner";

export default class implements ProxyProvider {
  private eth: HardhatEthers;

  constructor(_eth: HardhatEthers) {
    this.eth = _eth;
  }

  public async getSigner(address: string) {
    return await this.eth.getSigner(address);
  }

  public async getSigners(){
    return await this.eth.getSigners();
  }

  public async getContractAt(nameOrAbi: string | Artifact, address: string, signer?: ReefSigner): Promise<Contract> {
    if (typeof nameOrAbi === "string") {
      await this.getContractFactory(nameOrAbi, signer);
    }
    return await this.eth.getContractAt(nameOrAbi as any, address, signer as SignerWithAddress);
  }

  public async getContractFactory(contractName: string, signer?: ReefSigner | string, args?: any[]) {
    const contract = await loadContract(contractName);
    const wallet = await this.resolveSigner(signer) as SignerWithAddress;
    return ContractFactory
      .fromSolidity(contract)
      .connect(wallet)
      .deploy(args ? args : true);
  }

  private async resolveSigner(signer?: ReefSigner | string): Promise<ReefSigner> {
    if (signer === undefined)
      return (await this.eth.getSigners())[0];
    if (typeof signer === "string")
      return this.getSigner(signer);
    return signer;
  }
}
