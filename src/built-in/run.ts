import { TASK_RUN } from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";
import { runScriptWithHardhat } from "hardhat/internal/util/scripts-runner";
import { HardhatPluginError } from "hardhat/plugins";

import { startChain, stopChain } from "../reef-chain/chain-runner";
import { ensureFilePath } from "../utils";

task(TASK_RUN, "Run script on Reef chain").setAction(
  async (
    { script }: { script: string },
    { run, hardhatArguments, config, network }
  ) => {
    try {
      await run("compile");
      await ensureFilePath(script);
      await startChain(network.name, config);
      await runScriptWithHardhat(hardhatArguments, script);
      await stopChain();
    } catch (error) {
      throw new HardhatPluginError("Reef-chain-provider", error.message);
    }
  }
);
