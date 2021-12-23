// tslint:disable-next-line no-implicit-dependencies
import { assert, expect } from "chai";
import { ContractFactory } from "ethers";

import EthersProxy from "../src/proxies/EthersProxy";

import { useEnvironment } from "./helpers";

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

describe("Unit testing", function () {
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
    it("Ensure default signers", async function () {
      Promise.resolve().then(() => {
        const promisses = [
          "alice",
          "bob",
          "charlie",
          "dave",
          "eve",
          "ferdie",
        ].forEach(async (signerName) => {
          const signer = await this.hre.reef.getSignerByName(signerName);
          assert.notEqual(
            signer,
            undefined,
            `Signer name: ${signerName} does not exist!`
          );
        });
      });
    });
  });

  describe("Get contract factory testing", function () {
    useEnvironment("hardhat-project");

    beforeEach(async function () {
      await this.hre.run("compile", { quiet: true });
    });

    it("Has the Flipper contract factory", async function () {
      const Flipper = await this.hre.reef.getContractFactory("Flipper");
      assert.instanceOf(Flipper, ContractFactory);
    });
    it("Deployed Flipper contract has correct value", async function () {
      const Flipper = await this.hre.reef.getContractFactory("Flipper");
      const flipper = await Flipper.deploy(true);
      await flipper.deployed();
      assert.equal(await flipper.get(), true);
    });
    it("Switch values in Flipper contract", async function () {
      const Flipper = await this.hre.reef.getContractFactory("Flipper");
      const flipper = await Flipper.deploy(true);
      await flipper.deployed();
      assert.equal(await flipper.get(), true);
      await flipper.flip();
      assert.equal(await flipper.get(), false);
    });
    it("Deploy contract with signer who was picked by name", async function () {
      const alice = await this.hre.reef.getSignerByName("alice");
      const Flipper = await this.hre.reef.getContractFactory("Flipper", alice);
      const flipper = await Flipper.deploy(true);

      const aliceAddress = await alice.getAddress();
      const signer = await flipper.signer.getAddress();
      assert.equal(signer, aliceAddress);
    });
    it("Deploy contract with signer from getSigners", async function () {
      const signers = await this.hre.reef.getSigners();
      const alice = signers[0];
      const Flipper = await this.hre.reef.getContractFactory("Flipper", alice);
      const flipper = await Flipper.deploy(true);

      const aliceAddress = await alice.getAddress();
      const signer = await flipper.signer.getAddress();
      assert.equal(signer, aliceAddress);
    });
    it("Deploy contract with signers address", async function () {
      const bob = await this.hre.reef.getSignerByName("bob");
      const bobAddress = await bob.getAddress();
      const Flipper = await this.hre.reef.getContractFactory(
        "Flipper",
        bobAddress
      );
      const flipper = await Flipper.deploy(true);

      assert.equal(await flipper.signer.getAddress(), bobAddress);
    });
    it("Signer is not owner of the Flipper contract", async function () {
      const [s1, s2] = await this.hre.reef.getSigners();

      const Flipper = await this.hre.reef.getContractFactory("Flipper", s1);
      const flipper = await Flipper.deploy(true);
      const flipperSignersAddress = await flipper.signer.getAddress();

      assert.notEqual(flipperSignersAddress, await s2.getAddress());
    });
  });

  describe("Get contract at testing", function () {
    useEnvironment("hardhat-project");

    beforeEach(async function () {
      await this.hre.run("compile", { quiet: true });
    });

    it("Find flipper contract", async function () {
      const Flipper = await this.hre.reef.getContractFactory("Flipper");
      const flipper = await Flipper.deploy(true);

      const foundFlipper = await this.hre.reef.getContractAt(
        "Flipper",
        flipper.address
      );
      assert.equal(foundFlipper.address, flipper.address);
    });
    it("Flind Flipper contract with abi", async function () {
      const Flipper = await this.hre.reef.getContractFactory("Flipper");
      const flipper = await Flipper.deploy(true);

      const flipperAbi = await this.hre.artifacts.readArtifact("Flipper");
      const foundFlipper = await this.hre.reef.getContractAt(
        flipperAbi.abi,
        flipper.address
      );
      assert.equal(foundFlipper.address, flipper.address);
    });
    it("Get contract with signer", async function () {
      const dave = await this.hre.reef.getSignerByName("dave");
      const daveAddress = await dave.getAddress();
      const Flipper = await this.hre.reef.getContractFactory(
        "Flipper",
        daveAddress
      );
      const flipper = await Flipper.deploy(true);

      const foundFlipper = await this.hre.reef.getContractAt(
        "Flipper",
        flipper.address,
        dave
      );
      assert.equal(foundFlipper.address, flipper.address);
    });
  });
});
