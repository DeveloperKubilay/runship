const firebase = require("./firebase");
const archiver = require('archiver');
const ssh = require('./sshClient');
const fs = require('fs');

module.exports = {
    ...firebase,
    deploy: async function (config) {
        const vms = await firebase.getAllVMs();

        try { fs.unlinkSync('deploy.zip') } catch (e) { }
        const output = fs.createWriteStream('deploy.zip');
        const archive = archiver('zip');
        archive.pipe(output);
        archive.directory(config.uploadFolder + '/', false);
        await archive.finalize();

        const batchSize = 5;
        for (let i = 0; i < vms.length; i += batchSize) {
            const batch = vms.slice(i, i + batchSize);
            await Promise.all(batch.map(async (vm) => {
                console.log("Deploying to VM:", vm.host);
                if (vm.path.slice(-1) !== '/') vm.path += '/';
                const commands = ssh.generateCode(vm.path, config.serviceName);
                const server = await ssh.newSSHClient(vm);

                if (!server) return console.error(`Failed to connect to VM: ${vm.host}`);

                try {
                    if (config.beforeUpload) await server.exec(commands.normal + config.beforeUpload);

                    await server.exec(commands.start);
                    await server.upload("./deploy.zip", vm.path + 'deploy.zip');
                    await server.exec(commands.end);

                    if (config.beforeRun) await server.exec(commands.normal + config.beforeRun);
                    await server.exec(commands.service)
                } catch (err) {
                    console.error(`Error during deployment to VM: ${vm.host}`, err);
                } finally {
                    server.close();
                    console.log("Deployment to VM completed:", vm.host);
                }
            }));
        }

        try { fs.unlinkSync('deploy.zip') } catch (e) { }
        console.log("Deployment to all VMs completed.");

    }
};