const autoship = require("./module");
const config = require("./config.json");

async function main() {
    autoship.connect(config);

    await autoship.deploy({
        uploadFolder: "example-folder",
        serviceName: "example.service",
        multiply: 5,
        beforeUpload: "mv data.json ../data.json",
        beforeRun: "echo hi > test.txt && mv ../data.json data.json && /usr/bin/npm i",
    });

    process.exit(0);
}

main();