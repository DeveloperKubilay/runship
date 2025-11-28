const autoship = require("./module");

async function main() {
    autoship.connect(require("./config.json").firebaseConfig);

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