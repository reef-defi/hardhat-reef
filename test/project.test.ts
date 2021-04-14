// tslint:disable-next-line no-implicit-dependencies
import { Provider, Signer } from "@reef-defi/evm-provider";
import { assert, expect } from "chai";
import { ContractFactory } from "ethers";
import path from "path";

import EthersProxy from "../src/proxies/EthersProxy";
import { ReefSigner } from "../src/proxies/signers/ReefSigner";

import { useEnvironment } from "./helpers";
// import { EthersSigner } from "../src/proxies/signers/EthersSigner";

describe("Integration tests examples", function () {
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    it("Should add the Ethers field", function () {
      assert.instanceOf(this.hre.reef, EthersProxy);
    });

    it("Reef provider should extend runtime functions", async function () {
      assert.isDefined(this.hre.reef);
    });
  });
});

describe("Unit testing", function() {
  describe("Signers", function () {
    useEnvironment("hardhat-project");

    it("Has signers", async function () {
      const signers = await this.hre.reef.getSigners();
      expect(signers.length > 0);
    });

    it("Find signer by address", async function () {
      const [signer] = await this.hre.reef.getSigners();
      const addr1 = await signer.getAddress();
      const findSiner = await this.hre.reef.getSigner(addr1);
      const addr2 = await findSiner.getAddress();
      assert.equal(addr1, addr2, "Addresses are not equal");
    });

    it("Finding signer by the name alice", async function () {
      const alice = await this.hre.reef.getSignerByName("alice");
      assert.notEqual(alice, undefined, "Alice does not exist!");
    });
  });

  describe("Proxy", function () {
    useEnvironment("hardhat-project");

    beforeEach(async function() {
      await this.hre.run("compile", { quiet: true });
    });

    it("Has the Flipper contract factory", async function () {
      const Flipper = await this.hre.reef.getContractFactory("Flipper");
      assert.instanceOf(Flipper, ContractFactory);
    });
    it("Deployed Flipper contract has correct value", async function () {
      const Flipper = await this.hre.reef.getContractFactory("Flipper");
      const flipper = await Flipper.deploy(true);
      assert.equal(await flipper.get(), true);
    })
  });
})
