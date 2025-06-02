import { setupPostgres } from "./postgres.js";
import { setupSqlite } from "./sqlite.js";
export var DbType;
(function (DbType) {
    DbType["Sqlite"] = "sqlite";
    DbType["Postgres"] = "postgres";
})(DbType || (DbType = {}));
export function setupDb({ appName, dbType, pathToApp, }) {
    switch (dbType) {
        case DbType.Sqlite:
            return setupSqlite({ appName, pathToApp });
        case DbType.Postgres:
            return setupPostgres({ appName, pathToApp });
        default:
            dbType;
            throw new Error(`Unknown database type: ${dbType}`);
    }
}
//# sourceMappingURL=index.js.map