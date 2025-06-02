import { setupDb } from "../db/index.js";
import { startLocalSmtpServer } from "../smtp.js";
import { waspBuild } from "../waspCli.js";
import { buildAndRunClientApp } from "./client.js";
import { buildAndRunServerApp } from "./server.js";
// Based on https://github.com/wasp-lang/wasp/issues/1883#issuecomment-2766265289
export async function startAppInBuildMode({ waspCliCmd, pathToApp, appName, dbType, }) {
    await waspBuild({
        waspCliCmd,
        pathToApp,
    });
    const { dbEnvVars } = await setupDb({
        appName,
        dbType,
        pathToApp,
    });
    await startLocalSmtpServer();
    // Client needs to be running before the server
    // becuase headless tests start executing as soon
    // as the server is up.
    await buildAndRunClientApp({
        pathToApp,
    });
    await buildAndRunServerApp({
        appName,
        pathToApp,
        extraEnv: dbEnvVars,
    });
}
//# sourceMappingURL=index.js.map