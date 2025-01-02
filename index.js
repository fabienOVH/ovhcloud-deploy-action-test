const core = require('@actions/core');
const { execSync } = require('child_process');

async function deploy() {
  try {
    const sshHost = core.getInput('ssh_host');
    const sshUser = core.getInput('ssh_user');
    const sitePath = core.getInput('site_path');

    console.log('Test SSH direct');
    const debugCommand = `ssh -o StrictHostKeyChecking=no ${sshUser}@${sshHost} echo "Connexion test manuelle réussie"`;
    execSync(debugCommand, { stdio: 'inherit' });

    console.log('Connexion SSH réussie. Déploiement en cours...');
    const rsyncCommand = `
      rsync -avz --delete-excluded --exclude='.git*' -e "ssh -o StrictHostKeyChecking=no" ./ ${sshUser}@${sshHost}:${sitePath}/
    `;
    execSync(rsyncCommand, { stdio: 'inherit' });

    console.log('Déploiement réussi.');
  } catch (error) {
    console.error('Erreur pendant le déploiement :', error.message);
    process.exit(1);
  }
}

deploy();
