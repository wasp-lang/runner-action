import { program, Argument } from "@commander-js/extra-typings";
export function parseArgs() {
    const parsedProgram = program
        .name("run-wasp-app")
        .description("Run the Wasp application")
        .addArgument(new Argument("<mode>", "The run mode").choices(["dev", "build"]))
        .option("--path-to-app <path>", "Path to the Wasp application", ".")
        .option("--wasp-cli-cmd <command>", "Wasp CLI command to use", "wasp")
        .parse();
    if (process.argv.length === 2) {
        program.help();
    }
    program.parse();
    const options = parsedProgram.opts();
    const args = parsedProgram.processedArgs;
    return {
        mode: args[0],
        pathToApp: options.pathToApp,
        waspCliCmd: options.waspCliCmd,
    };
}
//# sourceMappingURL=args.js.map