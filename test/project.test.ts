// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import path from "path";


import { BodhiProxy } from "./proxies/BodhiProxy";
import { Provider, Signer } from "@acala-network/bodhi";

import { useEnvironment } from "./helpers";

describe("Integration tests examples", function () {
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

  });

});
