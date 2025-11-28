const autoship = require("./module");

async function main() {
    autoship.connect(require("./config.json").firebaseConfig);

    await autoship.deploy({
        uploadFolder: "module",
       // serviceName: "test-service",

        multiply: 5,
        beforeUpload: "echo hi > test.txt",
        afterRun: "echo hi > test2.txt",
    });
}

main();