const firebase = require("./firebase");
const archiver = require('archiver');
const ssh = require('./sshClient');
const fs = require('fs');
const jsonDatabase = require("./jsonDatabase");

async function processVMs(config, batchSize, action) {
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
        await processVMs(config, 5, async (vm, server) => {
            const command = ssh.createService(config, vm);
            await server.exec(command);
        });
    },
    startService: async function (config) {
        await processVMs(config, 5, async (vm, server) => {
            const command = ssh.startService(config);
            await server.exec(command);
        });
    },
    deploy: async function (config) {
        const dataSource = firebase.isconnected() ? firebase : jsonDatabase;
        const vms = await dataSource.getAllVMs();

        try { fs.unlinkSync('TempDeploy.zip'); } catch (e) { }
        const output = fs.createWriteStream('TempDeploy.zip');
        const archive = archiver('zip');
        archive.pipe(output);
        archive.directory(config.uploadFolder + '/', false, (entry) => 
            entry.name !== 'TempDeploy.zip' ? entry : undefined 
        );
        await archive.finalize();

        await processVMs(config, 5, async (vm, server) => {
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