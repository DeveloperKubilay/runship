const firebase = require("./firebase");
const archiver = require('archiver');
const ssh = require('./sshClient');
const fs = require('fs');
const path = require('path');
const jsonDatabase = require("./jsonDatabase");

function getIgnoreList(uploadFolder) {
    const defaultIgnores = ['TempDeploy.zip', '.git', 'runship.ignore', '.runshipignore'];
    const userPatterns = [];
    const ignoreFiles = ['runship.ignore', '.runshipignore'];

    for (const file of ignoreFiles) {
        const fullPath = path.join(uploadFolder, file);
        if (fs.existsSync(fullPath)) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
                userPatterns.push(...lines);
            } catch (e) { }
            break;
        }
    }

    return [...defaultIgnores, ...userPatterns];
}

function shouldIgnore(entryName, patterns) {
    const normalizedName = entryName.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

    for (let pattern of patterns) {
        pattern = pattern.replace(/\\/g, '/').trim();
        if (!pattern) continue;

        let cleanPattern = pattern.replace(/^\/+|\/+$/g, '');

        if (pattern.startsWith('*.')) {
            const ext = pattern.slice(1);
            if (normalizedName.endsWith(ext)) return true;
        } else if (cleanPattern === normalizedName) {
            return true;
        } else if (normalizedName.startsWith(cleanPattern + '/')) {
            return true;
        } else if (normalizedName.includes('/' + cleanPattern + '/') || normalizedName.endsWith('/' + cleanPattern)) {
            return true;
        }
    }
    return false;
}

async function processVMs(config, action) {
    const batchSize = config.multiply || 1;
    const dataSource = firebase.isconnected() ? firebase : jsonDatabase;
    const vms = await dataSource.getAllVMs();

    for (let i = 0; i < vms.length; i += batchSize) {
        const batch = vms.slice(i, i + batchSize);
        await Promise.all(batch.map(async (vm) => {
            const server = await ssh.newSSHClient(vm);
            if (!server) {
                if (config.verbose) console.error(`Failed to connect to VM: ${vm.host}`);
                return;
            }
            try {
                await action(vm, server);
            } catch (e) {
                if (config.verbose) console.error(`Error processing VM: ${vm.host}`, e);
            } finally {
                server.close();
            }
        }));
    }
}

module.exports = {
    ...firebase,
    ...jsonDatabase,
    createService: async function (config) {
        await processVMs(config, async (vm, server) => {
            const command = ssh.createService(config, vm);
            await server.exec(command);
        });
    },
    startService: async function (config) {
        await processVMs(config, async (vm, server) => {
            const command = ssh.startService(config);
            await server.exec(command);
        });
    },
    deploy: async function (config) {
        try { fs.unlinkSync('TempDeploy.zip'); } catch (e) { }
        const output = fs.createWriteStream('TempDeploy.zip');
        const archive = archiver('zip', { zlib: { level: 9 } });
        const ignorePatterns = getIgnoreList(config.uploadFolder || '.');

        const zipPromise = new Promise((resolve, reject) => {
            output.on('close', resolve);
            archive.on('error', reject);
        });

        archive.pipe(output);
        archive.directory(config.uploadFolder + '/', false, (entry) => {
            if (shouldIgnore(entry.name, ignorePatterns)) {
                return false;
            }
            return entry;
        });

        if (config.verbose) archive.on('entry', (entry) => {
            console.log('Archiving:', entry.name);
        });
        await archive.finalize();
        await zipPromise;

        await processVMs(config, async (vm, server) => {
            if (config.verbose) console.log("Deploying to VM:", vm.host);
            if (vm.path.slice(-1) !== '/') vm.path += '/';
            const commands = ssh.generateCode(vm.path, config.serviceName);

            try {
                if (config.beforeUpload) await server.exec(commands.normal + config.beforeUpload);

                await server.exec(commands.start);
                await server.upload("./TempDeploy.zip", vm.path + 'TempDeploy.zip');
                await server.exec(commands.end);

                if (config.beforeRun) await server.exec(commands.normal + config.beforeRun);
                await server.exec(commands.service);
            } catch (err) {
                if (config.verbose) console.error(`Error during deployment to VM: ${vm.host}`, err);
            } finally {
                if (config.verbose) console.log("Deployment to VM completed:", vm.host);
            }
        });

        try { fs.unlinkSync('TempDeploy.zip'); } catch (e) { }
        if (config.verbose) console.log("Deployment to all VMs completed.");
    }
};