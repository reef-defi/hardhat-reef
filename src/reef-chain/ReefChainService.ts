import { ChildProcess, exec, spawn } from "child_process";
import { throwError } from "../utils";

export default class ReefChainService {
  private static service: ChildProcess | undefined;
  private static killReefProcessStatements = "ps -A | grep reef-node | grep -v grep | awk '{print $1}' | xargs kill -9";

  public static async createService(chainPath: string) {
    await ReefChainService.buildChain(chainPath)
    return new Promise((resolve, reject) => {
      console.log("Starting Reef-node service!");
      ReefChainService.service = exec(`cd ${chainPath} && make run`, (err) => {
        if (err) {
          reject(err.message);
        }
      });
      // TODO timer is set to not show Provider warnings 
      // this must be removed in future!
      // timeout constant is also set to some high enough value to ensure chain 
      // is up in running when the Provider is called.
      setTimeout(() => resolve(1), 3300);
    })
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


  // TODO this does not 
  private static async buildChain(chainPath: string) {
    console.log("Building Reef chain");
    return new Promise((resolve, reject) => {
      exec(`cd ${chainPath} && make build`, (error) => {
        if (error) {
          reject(error.message);
        }
        resolve(1);
      });
    })
  }

}
