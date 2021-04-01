import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers";

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

  public async getContractFactory(contractName: string, signer?: ReefSigner) {
    this.eth.getContractFactory("Test", {})
    const contract = await loadContract(contractName);
    const wallet = signer 
      ? signer as SignerWithAddress
      : (await this.eth.getSigners())[0];
    return ContractFactory.fromSolidity(contract).connect(wallet);
  }
}
