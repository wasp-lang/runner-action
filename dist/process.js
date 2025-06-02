import readline from "readline";
import { spawn } from "child_process";
import { createLogger } from "./logging.js";
class ChildProcessManager {
    children = [];
    logger = createLogger("child-process-manager");
    constructor() {
        process.on("SIGINT", () => this.cleanExit("SIGINT"));
        process.on("SIGTERM", () => this.cleanExit("SIGTERM"));
        process.on("exit", (exitCode) => this.cleanExit(`exit code ${exitCode}`));
    }
    addChild(child) {
        this.children.push(child);
    }
    removeChild(proc) {
        const index = this.children.indexOf(proc);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }
    cleanExit(reason) {
        if (this.children.length === 0) {
            return;
        }
        this.logger.warn(`Received ${reason}. Cleaning up...`);
        this.children.forEach((child) => {
            if (!child.killed) {
                child.kill();
            }
        });
        process.exit();
    }
}
const childProcessManager = new ChildProcessManager();
export function spawnWithLog({ name, cmd, args, cwd, extraEnv = {}, }) {
    return new Promise((resolve, reject) => {
        const logger = createLogger(name);
        const proc = spawn(cmd, args, {
            cwd,
            env: { ...process.env, ...extraEnv },
            stdio: ["ignore", "pipe", "pipe"],
        });
        childProcessManager.addChild(proc);
        readStreamLines(proc.stdout, (line) => logger.info(line));
        readStreamLines(proc.stderr, (line) => logger.error(line));
        proc.on("error", (err) => {
            logger.error(`Process error: ${err.message}`);
            reject(err);
        });
        proc.on("close", (exitCode) => {
            childProcessManager.removeChild(proc);
            if (exitCode === 0) {
                logger.success("Process completed successfully");
                resolve({
                    exitCode,
                });
            }
            else {
                logger.error(`Process exited with code ${exitCode}`);
                reject({
                    exitCode,
                });
            }
        });
    });
}
export function spawnAndCollectOutput({ cmd, args, cwd, }) {
    let stdoutData = "";
    let stderrData = "";
    return new Promise((resolve) => {
        const proc = spawn(cmd, args, {
            cwd,
        });
        childProcessManager.addChild(proc);
        readStreamLines(proc.stdout, (line) => (stdoutData += line + "\n"));
        readStreamLines(proc.stderr, (line) => (stderrData += line + "\n"));
        proc.on("close", (exitCode) => {
            childProcessManager.removeChild(proc);
            resolve({
                exitCode,
                stdoutData,
                stderrData,
            });
        });
    });
}
function readStreamLines(stream, callback) {
    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    });
    rl.on("line", callback);
}
//# sourceMappingURL=process.js.map