import { ChildProcess, exec } from "child_process";
import fs from "fs";
import fetch from "node-fetch";
import os from "os";

const REEF_NODE_FOLDER = `${os.homedir()}/.reef`;
const REEF_NODE_FILE_PATH = `${REEF_NODE_FOLDER}/reef-node-2.1`;
const UNIX_REEF_NODE_RELEASE =
  "https://github.com/reef-defi/reef-chain/releases/download/testnet-2.1/reef-node";
const KILL_REEF_NODE_COMMAND =
  "ps -A | grep reef-node | grep -v grep | awk '{print $1}' | xargs kill -9";

export default class ReefChainService {
  public static async createService() {
    await ReefChainService.pullChain();
    return new Promise((resolve, reject) => {
      console.log("Starting Reef-node service!");
      ReefChainService.service = exec(
        `${REEF_NODE_FILE_PATH} --dev --tmp`,
        (err) => {
          if (err) {
            reject(err.message);
          }
        }
      );
      // TODO timer is set to not show Provider warnings
      // this must be removed in future!
      // timeout constant is also set to some high enough value to ensure chain
      // is up in running when the Provider is called.
      setTimeout(() => resolve(1), 3300);
    });
  }

  public static async stopService() {
    if (ReefChainService.service) {
      console.log("Stopping Reef-node service!");
      await ReefChainService.killReefProcess();
      ReefChainService.service.kill();
      ReefChainService.service = undefined;
    }
  }
  private static service: ChildProcess | undefined;

  private static async killReefProcess(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(KILL_REEF_NODE_COMMAND, (err) => {
        err ? reject(err) : resolve();
      });
    });
  }

  // Pull reef chain from reef-chain release
  private static async pullChain() {
    if (!fs.existsSync(REEF_NODE_FOLDER)) {
      fs.mkdirSync(REEF_NODE_FOLDER);
    }
    if (!fs.existsSync(REEF_NODE_FILE_PATH)) {
      await downloadFile(UNIX_REEF_NODE_RELEASE, REEF_NODE_FILE_PATH);
    }
  }
}

const downloadFile = async (url: string, filePath: string) => {
  console.log("Downloading reef-node...");
  return Promise.resolve()
    .then(() => fetch(url))
    .then((data) => data.buffer())
    .then((buffer) => saveBufferToFile(buffer, filePath));
};

const saveBufferToFile = async (
  buffer: Buffer,
  filePath: string
): Promise<void> => {
  console.log("Saving reef-node...");
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, buffer, (err) => {
      err ? reject(err) : resolve();
    });
  });
};
