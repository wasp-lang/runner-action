import { Argument, program } from "@commander-js/extra-typings";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Branded } from "./types.js";

export type Mode = "dev" | "build";
export type PathToApp = Branded<string, "PathToApp">;
export type WaspCliCmd = Branded<string, "WaspCliCmd">;

export function parseArgs(): {
  mode: Mode;
  pathToApp: PathToApp;
  waspCliCmd: WaspCliCmd;
} {
  const parsedProgram = program
    .name("run-wasp-app")
    .description("Run the Wasp application")
    .version(getPackageJsonVersion())
    .addArgument(
      new Argument("<mode>", "The run mode").choices(["dev", "build"])
    )
    .option("--path-to-app <path>", "Path to the Wasp application", ".")
    .option("--wasp-cli-cmd <command>", "Wasp CLI command to use", "wasp")
    .parse();

  if (process.argv.length === 2) {
    program.help();
  }

  program.parse();

  const options = parsedProgram.opts();
  const args = parsedProgram.processedArgs;

  return {
    mode: args[0],
    pathToApp: options.pathToApp as PathToApp,
    waspCliCmd: options.waspCliCmd as WaspCliCmd,
  };
}

function getPackageJsonVersion(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(packageJsonContent);
  return packageJson.version;
}
