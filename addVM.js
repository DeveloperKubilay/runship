const firebase = require("./module");
const fs = require("fs");

async function main() {
    firebase.connect(require("./config.json").firebaseConfig);

    await firebase.addTestVM({
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