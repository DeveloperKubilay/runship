# Auto-Deploy 🚀

## Demo 🎥
Check out the example video:
https://youtu.be/Y0v-qoW07jI

Auto-Deploy is a Node.js-based deployment automation tool designed to simplify the process of deploying applications to multiple virtual machines (VMs). It leverages Firebase for VM management and SSH for secure communication.

## Features 🌟
- **Firebase Integration**: Manage VMs securely with Firebase Firestore.
- **Encryption**: Sensitive data is encrypted using AES-256-CBC.
- **Batch Deployment**: Deploy to multiple VMs in parallel with configurable batch sizes.
- **Customizable Hooks**: Run pre-upload and pre-run commands for flexible deployment workflows.

## Installation 🛠️
1. Install the package:
   ```bash
   npm install runship
   ```

## Configuration ⚙️
Update the `config.json` file with your Firebase configuration and encryption password:
```json
{
  "firebaseConfig": {
    "apiKey": "<YOUR_API_KEY>",
    "authDomain": "<YOUR_AUTH_DOMAIN>",
    "projectId": "<YOUR_PROJECT_ID>",
    "storageBucket": "<YOUR_STORAGE_BUCKET>",
    "messagingSenderId": "<YOUR_MESSAGING_SENDER_ID>",
    "appId": "<YOUR_APP_ID>"
  },
  "Password": "<YOUR_ENCRYPTION_PASSWORD>"
}
```

## Usage 🚀
### Deploying Applications
1. Update the `index.js` file with your deployment configuration:
   ```javascript
   const runship = require("runship");
   runship.connect(require("./config.json").firebaseConfig);

   runship.deploy({
       uploadFolder: "example-folder",
       serviceName: "example.service",
       multiply: 5,
       verbose: true,
       beforeUpload: "mv data.json ../data.json",
       beforeRun: "echo hi > test.txt && mv ../data.json data.json && /usr/bin/npm i",
   });
   ```
   
### Adding a VM
1. Update the `addVM.js` file with your VM details:
   ```javascript
   const runship = require("runship");
   runship.connect(require("./config.json").firebaseConfig);

   runship.addTestVM({
       host: "<VM_HOST>",
       username: "<USERNAME>",
       password: null,
       port: 22,
       path: "/home/user/module",
       privateKey: fs.readFileSync("path/to/private/key", 'utf8'),
   });
   ```