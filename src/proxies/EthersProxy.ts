import { ContractFactory } from "ethers";

import { HardhatEthers, ProxyProvider } from "../types";
import { loadContract } from "../utils";

export default class implements ProxyProvider {
  private eth: HardhatEthers;

  constructor(_eth: HardhatEthers) {
    this.eth = _eth;
  }

  public async setup() {}
  public async getContractFactory(contractName: string) {
    const contract = await loadContract(contractName);
    const [wallet] = await this.eth.getSigners();
    return ContractFactory.fromSolidity(contract).connect(wallet);
  }
}
