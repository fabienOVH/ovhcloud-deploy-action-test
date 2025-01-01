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

// Vérification de l'encodage
console.log('Clé privée brute (debug, 50 premiers caractères) :', sshPrivateKey.slice(0, 50) + '...');
const encodedKey = Buffer.from(sshPrivateKey, 'utf8');
console.log('Encodage après Buffer :', encodedKey.toString('utf8').slice(0, 50) + '...');
console.log('Premiers caractères du secret SSH_PRIVATE_KEY :', sshPrivateKey.slice(0, 50) + '...');
const debugCommand = `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no ${sshUser}@${sshHost} echo "Connexion test manuelle réussie"`;
console.log('Commande SSH de test manuel :', debugCommand);

try {

    // Corriger les retours à la ligne et supprimer les espaces inutiles
const sanitizedKey = sshPrivateKey.replace(/\r\n/g, '\n').trim();

    fs.writeFileSync(sshKeyPath, sanitizedKey, { mode: 0o600 });
    console.log(`Clé SSH temporaire écrite dans : ${sshKeyPath}`);
} catch (error) {
    console.error('Erreur lors de l’écriture du fichier clé SSH :', error.message);
    process.exit(1);
}

// Vérifier si le fichier a été écrit
    if (!fs.existsSync(sshKeyPath)) {
      throw new Error(`Le fichier clé SSH ${sshKeyPath} n'existe pas.`);
    } else {
      console.log(`Le fichier clé SSH ${sshKeyPath} existe et est prêt à l'utilisation.`);
    }


try {
  execSync(debugCommand, { stdio: 'inherit' });
  console.log('Test SSH manuel réussi.');
} catch (error) {
  console.error('Test SSH manuel échoué :', error.message);
  throw error; // Pour stopper l'exécution si cela échoue
}

// Vérifier la clé
const writtenKey = fs.readFileSync(sshKeyPath, 'utf8');
console.log('Premiers caractères de la clé écrite :', writtenKey.slice(0, 50) + '...');


    // Vérifier les permissions
    const stats = fs.statSync(sshKeyPath);
    console.log('Permissions du fichier clé temporaire :', stats.mode.toString(8));

    // Tester la connexion SSH
    const testCommand = `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no ${sshUser}@${sshHost} echo "Connexion réussie"`;
    console.log('Commande de test SSH :', testCommand);

    console.log('Chemin temporaire pour la clé :', sshKeyPath);
    console.log('Commande SSH de test :', testCommand);

    try {
      execSync(testCommand, { stdio: 'inherit' });
      console.log('Test SSH réussi.');
    } catch (error) {
      throw new Error(`Test SSH échoué : ${error.message}`);
    }

    // Ajouter ici la commande rsync ou d'autres commandes spécifiques
    const rsyncCommand = `
      rsync -avz --delete --exclude='.git*' -e "ssh -v -i ${sshKeyPath} -o StrictHostKeyChecking=no" ./ ${sshUser}@${sshHost}:${sitePath}/
    `;

    console.log('Commande rsync :', rsyncCommand);
    execSync(rsyncCommand, { stdio: 'inherit' });
    console.log('Déploiement réussi.');
  } catch (error) {
    console.error('Erreur pendant le déploiement :', error.message);
    core.setFailed(error.message);
  }
}

deploy();
