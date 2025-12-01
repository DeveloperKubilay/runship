const { Client } = require('ssh2');

module.exports = {
    newSSHClient: async function (data) {
        const conn = new Client();
        try {
            if (!data.username) data.username = "root";
            if (!data.port) data.port = 22;
            if (!data.path) data.path = "/home/" + data.username + "/runship";
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
                        stream.on('close', resolve).on('data', (data) => { });
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
    },
    createService: function (config, vmsettings) {
        return `
FILE="${config.servicepath || "/etc/systemd/system"}/${config.name || "runship"}.service"

if [ "${config.overwrite ?? "true"}" != "true" ] && [ -f "$FILE" ]; then
  exit 1
fi

cat <<EOL | sudo tee "$FILE" > /dev/null
[Unit]
Description=${config.description || "Runship Service"}

[Service]
ExecStart=${config.execStart}
${config.autostart != false ? 'Restart=always' : ''}
User=${vmsettings.username}
WorkingDirectory="${vmsettings.path}"

[Install]
WantedBy=multi-user.target
EOL

sudo systemctl daemon-reload
${config.autostart != false ? `sudo systemctl enable ${config.name || "runship"}` : ''}
sudo systemctl start ${config.name || "runship"}
`;
    },
    startService: function (config) {
        return `
sudo systemctl start ${config.name}
`;
    }

}