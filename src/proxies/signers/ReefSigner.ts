import { Signer } from "@reef-defi/evm-provider";

import { ProxySigner } from "./ProxySigner";

// Class is never used and is defined just for type testing purposes
export default class ReefSigner extends Signer implements ProxySigner {}
