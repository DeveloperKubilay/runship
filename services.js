const runship = require("./module");
const config = require("./config.json");

async function main() {
    runship.json("./settings.json");

    await runship.createService({
        name: "alsatbotu",
        execStart: "/usr/bin/node index.js",
    });

    await runship.startService({
        name: "alsatbotu",
    });

    process.exit(0);
}

main();