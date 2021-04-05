// tslint:disable-next-line no-implicit-dependencies
import { Provider, Signer } from "@reef-defi/evm-provider";
import { assert } from "chai";
import path from "path";

import { useEnvironment } from "./helpers";
import { BodhiProxy } from "./proxies/BodhiProxy";

describe("Integration tests examples", function () {
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");
  });
});
