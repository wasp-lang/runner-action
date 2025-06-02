import { createLogger } from "../logging.js";
import { spawnAndCollectOutput } from "../process.js";
import { createAppSpecificDbContainerName, } from "../docker.js";
const logger = createLogger("postgres");
export const setupPostgres = async ({ appName, pathToApp }) => {
    await ensureDockerIsRunning();
    const databaseUrl = await startPostgresContainerForApp({
        appName,
        pathToApp,
    });
    logger.info(`Using DATABASE_URL: ${databaseUrl}`);
    return {
        dbEnvVars: { DATABASE_URL: databaseUrl },
    };
};
async function startPostgresContainerForApp({ appName, pathToApp, }) {
    const containerName = createAppSpecificDbContainerName({
        appName,
        pathToApp,
    });
    logger.info(`Using container name: ${containerName}`);
    const databaseUrl = await startPostgresContainerAndWaitUntilReady(containerName);
    return databaseUrl;
}
async function startPostgresContainerAndWaitUntilReady(containerName) {
    const port = 5432;
    const password = "devpass";
    const image = "postgres:16";
    logger.info("Starting the PostgreSQL container...");
    spawnAndCollectOutput({
        name: "create-postgres-container",
        cmd: "docker",
        args: [
            "run",
            "--name",
            containerName,
            "-p",
            `${port}:5432`,
            "-e",
            `POSTGRES_PASSWORD=${password}`,
            `--rm`,
            image,
        ],
    })
        // If we awaited here, we would block the main thread indefinitely.
        .then(({ exitCode, stderrData }) => {
        if (exitCode !== 0) {
            logger.error(stderrData);
            const extraInfo = getExtraInfoOnPostgresStartError({
                originalErrorText: stderrData,
                containerName,
                port,
            });
            if (extraInfo !== null) {
                logger.info(extraInfo);
            }
            process.exit(1);
        }
    });
    await waitForPostgresReady(containerName);
    return `postgresql://postgres:${password}@localhost:${port}/postgres`;
}
function getExtraInfoOnPostgresStartError({ originalErrorText, containerName, port, }) {
    const errorText = originalErrorText.toLowerCase();
    if (errorText.includes("is already in use by container")) {
        return `It looks like the cleanup failed, try running: "docker rm -f ${containerName}" and then try again.`;
    }
    if (errorText.includes("port is already allocated")) {
        return `It seems the port ${port} is already in use. Stop any other process using this port and try again.`;
    }
    return null;
}
async function waitForPostgresReady(containerName) {
    const healthCheckRetries = 10;
    const healthCheckDelay = 2000;
    for (let i = 1; i <= healthCheckRetries; i++) {
        logger.info(`Checking PostgreSQL readiness (attempt ${i}/${healthCheckRetries})`);
        const isPostgresReady = await checkIfPostgresIsReady(containerName);
        if (isPostgresReady) {
            logger.success("PostgreSQL is ready");
            return;
        }
        await wait(healthCheckDelay);
    }
    logger.error("PostgreSQL did not become ready in time");
    process.exit(1);
}
async function checkIfPostgresIsReady(containerName) {
    const { exitCode } = await spawnAndCollectOutput({
        name: "postgres-readiness-check",
        cmd: "docker",
        args: ["exec", containerName, "pg_isready", "-U", "postgres"],
    });
    return exitCode === 0;
}
async function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function ensureDockerIsRunning() {
    const isDockerRunning = await checkIfDockerIsRunning();
    if (isDockerRunning) {
        return;
    }
    logger.error("Docker is not running. Please start Docker and try again.");
    process.exit(1);
}
async function checkIfDockerIsRunning() {
    const { exitCode } = await spawnAndCollectOutput({
        name: "docker-health-check",
        cmd: "docker",
        args: ["info"],
    });
    return exitCode === 0;
}
//# sourceMappingURL=postgres.js.map