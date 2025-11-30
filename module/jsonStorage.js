const fs = require('fs');
const path = require('path');

let settingsPath = null;
let settingsData = null;

function setPath(newPath) {
    settingsPath = newPath;
    settingsData = null;
}

function setData(data) {
    settingsData = data;
    settingsPath = null;
}

function readVMs() {
    if (settingsData) {
        return settingsData;
    }
    if (settingsPath && fs.existsSync(settingsPath)) {
        const data = fs.readFileSync(settingsPath, 'utf8');
        return JSON.parse(data);
    }
    return { Vms: [] };
}

function writeVMs(vms) {
    if (settingsPath) {
        const data = { Vms: vms };
        fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf8');
    } else {
        throw new Error("Cannot write VMs without a valid path.");
    }
}

module.exports = {
    setPath,
    setData,
    readVMs,
    writeVMs
};