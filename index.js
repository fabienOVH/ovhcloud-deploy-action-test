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
    fs.writeFileSync(sshKeyPath, sshPrivateKey.replace(/\r\n/g, '\n'), { mode: 0o600 });
    console.log(`Clé SSH temporaire écrite dans : ${sshKeyPath}`);

    // Vérifier la clé temporaire
    const writtenKey = fs.readFileSync(sshKeyPath, 'utf8');
    console.log('Premiers caractères de la clé écrite :', writtenKey.slice(0, 50) + '...');

    // Vérifier les permissions
    const stats = fs.statSync(sshKeyPath);
    console.log('Permissions du fichier clé temporaire :', stats.mode.toString(8));

    // Tester la connexion SSH
    const testCommand = `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no ${sshUser}@${sshHost} echo "Connexion réussie"`;
    console.log('Commande de test SSH :', testCommand);
    try {
      execSync(testCommand, { stdio: 'inherit' });
      console.log('Test SSH réussi.');
    } catch (error) {
      throw new Error(`Test SSH échoué : ${error.message}`);
    }

try {
  execSync(testCommand, { stdio: 'inherit' });
  console.log('Test SSH réussi.');
} catch (error) {
  console.error('Erreur pendant le test SSH :', error);
  core.setFailed(error.message);
  return;
}

    // Ajouter ici la commande rsync ou d'autres commandes spécifiques
    const rsyncCommand = `
      rsync -avz --delete --exclude='.git*' -e "ssh -v -i ${sshKeyPath} -o StrictHostKeyChecking=no" ./ ${sshUser}@${sshHost}:${sitePath}/
    `;

console.log('Chemin temporaire pour la clé :', sshKeyPath);
console.log('Commande SSH de test :', testCommand);
console.log('Commande rsync :', rsyncCommand);



    console.log('Commande rsync :', rsyncCommand);
    execSync(rsyncCommand, { stdio: 'inherit' });
    console.log('Déploiement réussi.');
  } catch (error) {
    console.error('Erreur pendant le déploiement :', error.message);
    core.setFailed(error.message);
  }
}

deploy();
