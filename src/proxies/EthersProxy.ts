import { ContractFactory } from "ethers";
import { HardhatEthers, ProxyProvider } from "../types";
import { ensureFilePath } from "../utils";

export default class implements ProxyProvider {
  private eth: HardhatEthers;

  constructor(_eth: HardhatEthers) {
    this.eth = _eth;
  }

  public async setup() { }
  public async getContractFactory(contractName: string) {
    const contractFile = `${process.cwd()}/artifacts/contracts/${contractName}.sol/${contractName}.json`;
    await ensureFilePath(contractFile);
    const contract = await require(contractFile);
    
    const [wallet] = await this.eth.getSigners();

    const contractFactory = await ContractFactory
      .fromSolidity(contract)
      .connect(wallet);

    return contractFactory;
  }
}
