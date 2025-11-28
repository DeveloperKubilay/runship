const firebase = require("./module");

async function main() {
    firebase.connect(require("./config.json").firebaseConfig);

    await firebase.deploy({
        uploadFolder: "sample",
        runCommand: "echo hi"
    });
}

main();