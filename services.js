const runship = require("./module");
const config = require("./config.json");

async function main() {
    runship.json("./settings.json");

    await runship.createService({
        name: "example-service",
        execStart: "/usr/bin/node index.js",
    });

    await runship.startService({
        name: "example-service",
    });

    process.exit(0);
}

main();