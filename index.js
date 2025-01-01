const core = require('@actions/core');
const { execSync } = require('child_process');
const path = require('path');

async function deploy() {
  try {
    // Lire les entrées dynamiques depuis action.yml
    const sshHost = core.getInput('ssh_host');
    const sshUser = core.getInput('ssh_user');
    const sshPrivateKey = core.getInput('ssh_private_key');
    const sitePath = core.getInput('site_path');

    // Correction du répertoire courant
    console.log('Répertoire courant avant correction :', process.cwd());
    const actionDirectory = path.resolve(__dirname);
    process.chdir(actionDirectory);
    console.log('Répertoire courant après correction :', process.cwd());

    // Création de la commande rsync
    const rsyncCommand = `
      rsync -avz --delete --exclude='.git*' -e "ssh -i /home/debian/.ssh/deploy_key -o StrictHostKeyChecking=no" ./ ${sshUser}@${sshHost}:${sitePath}/
    `;
    console.log('Commande rsync :', rsyncCommand);

    // Exécution de la commande rsync localement
    execSync(rsyncCommand, { stdio: 'inherit' });

    console.log('Déploiement réussi.');
  } catch (error) {
    console.error('Erreur pendant le déploiement :', error.message);
    core.setFailed(error.message);
  }
}

deploy();
