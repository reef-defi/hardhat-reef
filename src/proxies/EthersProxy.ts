import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";
import { Artifact } from "hardhat/types";

import { HardhatEthers, ProxyProvider } from "../types";
import { throwError } from "../utils";
import { artifacts } from "hardhat";
import { ReefSigner } from "./signers/ReefSigner";

export default class implements ProxyProvider {
  private eth: HardhatEthers;

  constructor(_eth: HardhatEthers) {
    this.eth = _eth;
  }

  public async getSigner(address: string) {
    return this.eth.getSigner(address);
  }

  public async getSigners() {
    return this.eth.getSigners();
  }

  public async getSignerByName(name: string) {
    const signers = await this.getSigners();
    if (!(name in signerNames)) {
      throwError("Signer name does not exist!");
    }
    return signers[signerNames[name]];
  }

  public async getContractAt(
    nameOrAbi: string | Artifact,
    address: string,
    signer?: ReefSigner
  ): Promise<Contract> {
    const artifact = typeof nameOrAbi === "string" 
      ? await artifacts.readArtifact(nameOrAbi)
      : nameOrAbi;

    return this.eth.getContractAt(
      artifact.abi,
      address,
      signer as SignerWithAddress
    );
  }

  public async getContractFactory(
    contractName: string,
    signer?: ReefSigner | string
  ) {
    const contract = await artifacts.readArtifact(contractName);
    const wallet = (await this.resolveSigner(signer)) as SignerWithAddress;
    return ContractFactory.fromSolidity(contract)
      .connect(wallet)
  }

  private async resolveSigner(
    signer?: ReefSigner | string
  ): Promise<ReefSigner> {
    if (signer === undefined) {
      return (await this.eth.getSigners())[0];
    }
    if (typeof signer === "string") {
      return this.getSigner(signer);
    }
    return signer;
  }
}

const signerNames = ["alice", "bob", "charlie", "dave", "eve", "ferdie"].reduce(
  (acc, name, index) => {
    acc[name] = index;
    return acc;
  },
  {} as { [name: string]: number }
);
