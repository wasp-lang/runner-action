#!/usr/bin/env node
import { createLogger } from "./logging.js";
import { checkDependencies } from "./dependencies.js";
import { waspInfo } from "./waspCli.js";
import { startAppInDevMode } from "./dev/index.js";
import { startAppInBuildMode } from "./build/index.js";
import { parseArgs } from "./args.js";
const logger = createLogger("main");
export async function main() {
    const { mode, waspCliCmd, pathToApp } = parseArgs();
    try {
        await runWaspApp({
            mode,
            waspCliCmd,
            pathToApp,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error(`Fatal error: ${error.message}`);
        }
        else {
            logger.error(`Fatal error: ${error}`);
        }
        process.exit(1);
    }
}
async function runWaspApp({ mode, waspCliCmd, pathToApp, }) {
    await checkDependencies();
    const { appName, dbType } = await waspInfo({
        waspCliCmd,
        pathToApp,
    });
    logger.info(`Starting "${appName}" app (mode: ${mode}) using "${waspCliCmd}" command`);
    switch (mode) {
        case "dev":
            await startAppInDevMode({
                waspCliCmd,
                pathToApp,
                appName,
                dbType,
            });
            break;
        case "build":
            await startAppInBuildMode({
                waspCliCmd,
                pathToApp,
                appName,
                dbType,
            });
            break;
        default:
            mode;
    }
}
//# sourceMappingURL=index.js.map