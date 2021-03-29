import fsExtra from "fs-extra";
import { HardhatPluginError } from "hardhat/internal/core/errors";

export const ensureFilePath = async (filePath: string) => {
  if (!(await fsExtra.pathExists(filePath))) {
    throw new HardhatPluginError('',`File on path: ${filePath} does not exist...`);
  }
}
