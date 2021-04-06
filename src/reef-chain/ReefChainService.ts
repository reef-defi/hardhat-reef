import { ChildProcess, exec, spawn } from "child_process";
import { HardhatPluginError } from "hardhat/plugins";
import { throwError } from "../utils";

export default class ReefChainService {
  private static service: ChildProcess | undefined;
  private static killReefProcessStatements = "ps -A | grep reef-node | grep -v grep | awk '{print $1}' | xargs kill -9";

  public static async createService(chainPath: string) {
    console.log("Starting Reef-node service!");
    ReefChainService.service = exec(`cd ${chainPath} && make eth`, (err) => {
      if (err) {
        throwError(err.message);
      }
    });
  }

  public static async stopService() {
    if (ReefChainService.service) {
      console.log("Stopping Reef-node service!")
      await ReefChainService.killReefProcess();
      ReefChainService.service.kill();
      ReefChainService.service = undefined;
    }
  }

  private static async killReefProcess() {
    return new Promise((resolve) => {
      const child = exec(ReefChainService.killReefProcessStatements, (err) => {
        if (err) {
          throwError(err.message);
        }
      });
      child.on("close", () => {
        resolve(true);
      });
    })
  }

  // Pull reef chain from reef-chain release
  // private pullChain() { 

  //   this.buildChain();
  //  }

  private buildChain(chainPath: string) {
    return new Promise((resolve, reject) => {
      const build = spawn(`cd ${chainPath} && make build`);

      build.once("close", () => {
        resolve(1);
      });
      build.once("error", () => {
        reject();
      });
    })
  }

}
