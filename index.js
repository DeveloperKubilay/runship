const runship = require("./module");
const config = require("./config.json");

async function main() {
    const storage = runship.json("./settings.json");

    await runship.deploy({
        uploadFolder: "example-folder",
        serviceName: "example.service",
        multiply: 5,
        verbose: true,
        beforeUpload: "mv data.json ../data.json",
        beforeRun: "echo hi > test.txt && mv ../data.json data.json && /usr/bin/npm i",
    });

    process.exit(0);
}

main();