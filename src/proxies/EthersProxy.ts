import { Provider } from "@reef-defi/evm-provider";
import { Contract, ContractFactory } from "ethers";
import { HardhatPluginError } from "hardhat/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  CustomVerificationArguments,
  HardhatEthers,
  ProxyProvider,
} from "../types";
import { throwError } from "../utils";

import { EthersSigner } from "./signers/EthersSigner";
import { ProxySigner } from "./signers/ProxySigner";

export default class implements ProxyProvider {
  private eth: HardhatEthers;
  private hre: HardhatRuntimeEnvironment;

  constructor(_hre: HardhatRuntimeEnvironment) {
    this.eth = _hre.ethers;
    this.hre = _hre;
  }

  public async getSigner(address: string) {
    const ethSigner = await this.eth.getSigner(address);
    return EthersSigner.create(ethSigner);
  }

  public async getSigners() {
    const ethSigners = await this.eth.getSigners();
    const singers = await Promise.all(
      ethSigners.map(async (signer) => EthersSigner.create(signer))
    );
    return singers;
  }

  public async getSignerByName(name: string) {
    const signers = await this.getSigners();
    if (!(name in signerNames)) {
      throwError("Signer name does not exist!");
    }
    return signers[signerNames[name]];
  }

  public async getContractAt(
    nameOrAbi: string | any[],
    address: string,
    signer?: ProxySigner
  ): Promise<Contract> {
    return this.eth.getContractAt(nameOrAbi, address, signer as EthersSigner);
  }

  public async getContractFactory(
    contractName: string,
    signer?: ProxySigner | string
  ) {
    const wallet = await this.resolveSigner(signer);
    const contract = await this.hre.artifacts.readArtifact(contractName);
    return ContractFactory.fromSolidity(contract).connect(wallet);
  }

  public async getProvider(): Promise<Provider> {
    throw new HardhatPluginError(
      "Hardhat-reef",
      "Get provider in Ethers network is not supported..."
    );
  }

  public async verifyContract(
    address: string,
    name: string,
    args: any[],
    customArgs?: Partial<CustomVerificationArguments>
  ) {
    console.warn(
      "Ether proxy did not verify contract. Use hardhat ether scan library to verify contract!"
    );
  }

  private async resolveSigner(
    signer?: ProxySigner | string
  ): Promise<EthersSigner> {
    if (signer === undefined) {
      const signers = await this.getSigners();
      return signers[0];
    }
    if (typeof signer === "string") {
      return this.getSigner(signer);
    }
    return signer as EthersSigner;
  }
}

interface Signers {
  [name: string]: number;
}

const signerNames = ["alice", "bob", "charlie", "dave", "eve", "ferdie"].reduce(
  (acc: Signers, name, index) => {
    acc[name] = index;
    return acc;
  },
  {}
);
