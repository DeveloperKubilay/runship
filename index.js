const runship = require("./module");
const config = require("./config.json");

async function main() {
    const storage = runship.json("./settings.json");

    await storage.addTestVM({
        host: "18.194.153.171",
        username: "ec2-user",
        password: null,
        port: 22,
        path: "/home/ec2-user/module",
        privateKey: "PRIVATE_KEY_CONTENT",
    });

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