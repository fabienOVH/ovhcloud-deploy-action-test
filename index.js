const core = require('@actions/core');
const { Client } = require('ssh2');
const fs = require('fs');

async function deploy() {
  try {
    // Lire les entrées dynamiques depuis action.yml
    const sshHost = core.getInput('ssh_host');
    const sshUser = core.getInput('ssh_user');
    const sshPrivateKey = core.getInput('ssh_private_key');
    const sitePath = core.getInput('site_path');

    // Commande rsync ajustée
    const rsyncCommand = `
      rsync -avz --exclude='.git*' -e "ssh -i /home/debian/.ssh/deploy_key -o StrictHostKeyChecking=no" ./ ${sshUser}@${sshHost}:${sitePath}
    `;
    console.log('Executing rsync with command:', rsyncCommand);


    // Initialiser la connexion SSH
    const conn = new Client();
    conn
      .on('ready', () => {
        console.log('SSH connection established');

        conn.exec(rsyncCommand, (err, stream) => {
          if (err) {
            core.setFailed(`Command execution failed: ${err.message}`);
            conn.end();
            return;
          }

          stream
            .on('close', (code, signal) => {
              console.log(`Command finished with code ${code}, signal ${signal}`);
              conn.end();

              if (code === 0) {
                console.log('Deployment completed successfully.');
              } else {
                core.setFailed('Deployment failed.');
              }
            })
            .on('data', (data) => {
              console.log('STDOUT:', data.toString());
            })
            .stderr.on('data', (data) => {
              console.error('STDERR:', data.toString());
            });
        });
      })
      .on('error', (err) => {
        core.setFailed(`SSH connection failed: ${err.message}`);
      })
      .connect({
        host: sshHost,
        username: sshUser,
        privateKey: sshPrivateKey,
      });
  } catch (error) {
    core.setFailed(`Deployment failed: ${error.message}`);
  }
}

// Exécuter la fonction principale
deploy();
