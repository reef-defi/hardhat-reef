import { subtask } from "hardhat/config";
import ReefChainService from "../reef-chain/ReefChainService";
import { RUN_REEF_CHAIN } from "../reef-chain/task-names";

subtask(RUN_REEF_CHAIN, "Run Reef chain")
  .addOptionalParam("chain", "Path to chain", "./../reef/reef-chain/")
  .setAction(async (
    { chain }: { chain: string },
    {}
  ) => {
    const reefChain = new ReefChainService(chain);
    reefChain.createService();
  });
