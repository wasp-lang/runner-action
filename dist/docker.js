import { createHash } from "crypto";
export function createAppSpecificDbContainerName({ appName, pathToApp, }) {
    const prefix = createAppSpecificPrefix({
        appName,
        pathToApp,
    });
    return `${prefix}-db`;
}
export function createAppSpecificServerBuildDockerNames({ appName, pathToApp, }) {
    const prefix = createAppSpecificPrefix({
        appName,
        pathToApp,
    });
    return {
        imageName: `${prefix}-server`,
        containerName: `${prefix}-server-container`,
    };
}
function createAppSpecificPrefix({ appName, pathToApp, }) {
    const appPathHash = createHash("md5")
        .update(pathToApp)
        .digest("hex")
        .slice(0, 16);
    return `${appName}-${appPathHash}`.toLowerCase();
}
//# sourceMappingURL=docker.js.map