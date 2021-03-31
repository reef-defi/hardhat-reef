import { ChildProcess, exec, spawn } from "child_process";
import { HardhatPluginError } from "hardhat/internal/core/errors";

export default class ReefChainService {
  private reefChainPath = "";
  private static service: ChildProcess | undefined;

  constructor(chainPath: string) {
    this.reefChainPath = chainPath;
  }

  public createService() {
    ReefChainService.service = exec(`cd ${this.reefChainPath} && make eth`, (err) => {
      if (err) {
        throw new HardhatPluginError("Reef-chain", err.message);
      }
    });
  }

  public stopService() {
    if (ReefChainService.service) {
      ReefChainService.service.kill();
      ReefChainService.service = undefined;
    }
  }

  // Pull reef chain from reef-chain release
  private pullChain() { 

    this.buildChain();
   }

  private buildChain() {
    return new Promise((resolve, reject) => {
      const build = spawn(`cd ${this.reefChainPath} && make build`);

      build.once("close", () => {
        resolve(1);
      });
      build.once("error", () => {
        reject();
      });
    })
  }

}
