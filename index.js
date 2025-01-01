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

const rawKey = fs.readFileSync(sshKeyPath, 'utf8');
console.log('Clé SSH complète écrite temporairement :\n', rawKey);

// Vérifier la clé avant de l'écrire dans le fichier temporaire
console.log('Premiers caractères de la clé privée avant écriture :', sshPrivateKey.slice(0, 50) + '...');

// Écrire la clé privée dans un fichier temporaire avec remplacement des retours à la ligne
fs.writeFileSync(sshKeyPath, sshPrivateKey.replace(/\r\n/g, '\n'), { mode: 0o600 });

// Vérifier le contenu du fichier écrit
const writtenKey = fs.readFileSync(sshKeyPath, 'utf8');
console.log('Premiers caractères de la clé écrite :', writtenKey.slice(0, 50) + '...');

fs.chmodSync(sshKeyPath, 0o600);
console.log(`Permissions du fichier clé temporaire : ${fs.statSync(sshKeyPath).mode.toString(8)}`);

const testCommand = `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no ${sshUser}@${sshHost} echo "Connexion réussie"`;
console.log('Commande de test SSH :', testCommand);
try {
  execSync(testCommand, { stdio: 'inherit' });
  console.log('Test SSH réussi.');
} catch (error) {
  throw new Error(`Test SSH échoué : ${error.message}`);
}


    // Création de la commande rsync
    const rsyncCommand = `
      rsync -avz --delete --exclude='.git*' -e "ssh -v -i ${sshKeyPath} -o StrictHostKeyChecking=no" ./ ${sshUser}@${sshHost}:${sitePath}/
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
