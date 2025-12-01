const runship = require("runship");
const kubitdb = require("kubitdb");
const db = new kubitdb("config.json");
const fs = require("fs")

async function main() {
    const vms = db.get("vms");
    vms[0].privateKey = fs.readFileSync("SSH_PRIVATE_KEY.txt", "utf-8");
    db.set("vms", vms);

    runship.json("./config.json");

    await runship.deploy({
        uploadFolder: "../..",
        serviceName: "test.service",
        verbose: true,
        beforeRun: "/usr/bin/npm i",
    });

    process.exit(0);
}

main();
