const runship = require("./module");
const fs = require("fs");
const config = require("./config.json");

async function main() {
    runship.connect(config.firebaseConfig, config.password);

    await runship.addTestVM({
        host: "18.194.153.171",
        username: "ec2-user",
        password: null,
        port: 22,
        path:"/home/ec2-user/module",
        privateKey: fs.readFileSync("test.txt", 'utf8'),
    });
    console.log("VM added.");

    process.exit(0);
}

main();