import * as path from "path";
import { spawnWithLog } from "../process.js";
import { createAppSpecificServerBuildDockerNames, } from "../docker.js";
import { createLogger } from "../logging.js";
import { doesFileExits } from "../files.js";
const serverAppDir = ".wasp/build";
// Based on https://github.com/wasp-lang/wasp/issues/1883#issuecomment-2766265289
export async function buildAndRunServerApp({ appName, pathToApp, extraEnv, }) {
    const { imageName, containerName } = createAppSpecificServerBuildDockerNames({
        appName,
        pathToApp,
    });
    await buildServerAppContainer({
        pathToApp,
        imageName,
    });
    // This starts a long running process, so we don't await it.
    runServerAppContainer({
        pathToApp,
        imageName,
        containerName,
        extraEnv,
    });
}
async function buildServerAppContainer({ pathToApp, imageName, }) {
    const logger = createLogger("server-build-app");
    const { exitCode } = await spawnWithLog({
        name: "server-build-app",
        cmd: "docker",
        args: ["build", "-t", imageName, "."],
        cwd: path.join(pathToApp, serverAppDir),
    });
    if (exitCode !== 0) {
        logger.error(`Failed to build server app image: ${imageName}`);
        process.exit(1);
    }
}
async function runServerAppContainer({ pathToApp, imageName, containerName, extraEnv, }) {
    const logger = createLogger("server-start-app");
    const { exitCode } = await spawnWithLog({
        name: "server-start-app",
        cmd: "docker",
        args: [
            "run",
            "--rm",
            ...getDockerEnvVarsArgs({
                pathToApp,
                extraEnv,
            }),
            "--network",
            "host",
            "--name",
            containerName,
            imageName,
        ],
    });
    if (exitCode !== 0) {
        logger.error(`Failed to start server app container: ${containerName}`);
        process.exit(1);
    }
}
function getDockerEnvVarsArgs({ pathToApp, extraEnv, }) {
    const defaultRequiredEnv = {
        WASP_WEB_CLIENT_URL: "http://localhost:3000",
        JWT_SECRET: "some-jwt-secret",
        WASP_SERVER_URL: "http://localhost:3001",
    };
    return [
        ...mapEnvVarsToDockerArgs({ ...defaultRequiredEnv, ...extraEnv }),
        ...getDevEnvFileDockerArg({
            pathToApp,
        }),
    ];
}
function mapEnvVarsToDockerArgs(envVars) {
    return Object.entries(envVars).flatMap(([key, value]) => {
        return [`--env`, `${key}=${value}`];
    });
}
function getDevEnvFileDockerArg({ pathToApp, }) {
    const envFilePath = path.resolve(pathToApp, ".env.server");
    // Docker run command will fail if the file does not exist, so we check for it here.
    if (!doesFileExits(envFilePath)) {
        return [];
    }
    return ["--env-file", envFilePath];
}
//# sourceMappingURL=server.js.map