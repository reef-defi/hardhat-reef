// tslint:disable-next-line no-implicit-dependencies
import { Provider, Signer } from "@reef-defi/evm-provider";
import { assert, expect } from "chai";
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
  });

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
});
