import { setupDb } from "../db/index.js";
import { waspMigrateDb, waspStart } from "../waspCli.js";
export async function startAppInDevMode({ waspCliCmd, pathToApp, appName, dbType, }) {
    const { dbEnvVars } = await setupDb({
        appName,
        dbType,
        pathToApp,
    });
    await waspMigrateDb({
        waspCliCmd,
        pathToApp,
        extraEnv: dbEnvVars,
    });
    await waspStart({
        waspCliCmd,
        pathToApp,
        extraEnv: dbEnvVars,
    });
}
//# sourceMappingURL=index.js.map