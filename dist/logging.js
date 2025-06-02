import chalk from "chalk";
export function createLogger(processName) {
    const logTypeToColorFn = {
        error: chalk.red,
        warn: chalk.yellow,
        info: chalk.cyan,
        success: chalk.green,
        debug: chalk.gray,
    };
    function log(type, message) {
        const colorFn = logTypeToColorFn[type];
        const prefix = `[${processName}:${type}]`;
        console.log(`${colorFn(prefix)} ${message}`);
    }
    return {
        info(message) {
            log("info", message);
        },
        error(message) {
            log("error", message);
        },
        warn(message) {
            log("warn", message);
        },
        success(message) {
            log("success", message);
        },
        debug(message) {
            log("debug", message);
        },
    };
}
//# sourceMappingURL=logging.js.map