const core = require('@actions/core');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function deploy() {
  try {
    // Lire les entrées depuis action.yml
    const sshHost = core.getInput('ssh_host');
    const sshUser = core.getInput('ssh_user');
    const sshPrivateKey = core.getInput('ssh_private_key');
    const sitePath = core.getInput('site_path');

    // Créer un fichier temporaire pour la clé SSH
    const sshKeyPath = path.join(os.tmpdir(), 'deploy_key');
    fs.writeFileSync(sshKeyPath, sshPrivateKey, { mode: 0o600 });
    console.log(`Clé SSH temporaire écrite dans : ${sshKeyPath}`);

    // Création de la commande rsync
    const rsyncCommand = `
      rsync -avz --delete --exclude='.git*' -e "ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no" ./ ${sshUser}@${sshHost}:${sitePath}/
    `;
    console.log('Commande rsync :', rsyncCommand);

    // Exécution de la commande rsync
    execSync(rsyncCommand, { stdio: 'inherit' });

    console.log('Déploiement réussi.');

    // Optionnel : Supprimer la clé SSH temporaire après utilisation
    fs.unlinkSync(sshKeyPath);
    console.log('Clé SSH temporaire supprimée.');
  } catch (error) {
    console.error('Erreur pendant le déploiement :', error.message);
    core.setFailed(error.message);
  }
}

deploy();
