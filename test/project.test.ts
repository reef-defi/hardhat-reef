// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import path from "path";


import { Bodhi } from "../src/Bodhi";
import { Provider, Signer } from "@acala-network/bodhi";

import { useEnvironment } from "./helpers";

describe("Integration tests examples", function () {
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    it("Should add the bodhi field", function () {
      assert.instanceOf(
        this.hre.bodhi,
        Bodhi
      );
    });
  });

  describe("HardhatConfig extension", function () {
    useEnvironment("hardhat-project");

    it("Should add the newPath to the config", function () {
      assert.equal(
        this.hre.config.paths.newPath,
        path.join(process.cwd(), "asd")
      );
    });
  });
});
