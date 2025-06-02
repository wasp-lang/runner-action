import * as fs from "fs";
export function doesFileExits(filePath) {
    const stats = fs.statSync(filePath, { throwIfNoEntry: false });
    return stats !== undefined && stats.isFile();
}
//# sourceMappingURL=files.js.map