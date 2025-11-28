const firebase = require("./firebase");

module.exports = {
    ...firebase,
    deploy: async function (vmConfig, deployConfig) {
        const vms = await firebase.getAllVMs();
        
    }
};