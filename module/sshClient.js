const { Client } = require('ssh2');

module.exports = {
    newSSHClient: async function (data) {
        const conn = new Client();
        try {
            await new Promise((resolve, reject) => {
                conn.on('ready', resolve).on('error', reject).connect(data);
            });

            const sftp = await new Promise((resolve, reject) => {
                conn.sftp((err, sftp) => (err ? reject(err) : resolve(sftp)));
            });

            async function upload(file, path) {
                await new Promise((resolve, reject) => {
                    sftp.fastPut(file, path, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }

            async function exec(command) {
                return await new Promise((resolve, reject) => {
                    conn.exec(command, (err, stream) => {
                        if (err) return reject(err);
                        stream.on('close', resolve).on('data', (data) => {});
                    });
                });
            }

            return {
                upload,
                exec,
                close: () => conn.end(),
            };

        } catch (err) {
            return null; 
        }
    },
    generateCode: function (newpath, serviceName) {
        return {
            "start": `${serviceName ? `sudo systemctl stop ${serviceName} &&` : ''} export runship="${newpath}" && rm -rf $runship && mkdir -p $runship`,
            "end": `export runship="${newpath}" && cd $runship && unzip -o deploy.zip && rm -rf deploy.zip`,
            "normal": `export runship="${newpath}" && cd $runship &&`,
            "service": `${serviceName ? `sudo systemctl start ${serviceName}` : ''}`
        }
    }
}