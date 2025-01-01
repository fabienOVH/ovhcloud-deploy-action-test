const core = require('@actions/core');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function deploy() {
  try {
    const sshHost = core.getInput('ssh_host');
    const sshUser = core.getInput('ssh_user');
    const sshPrivateKey = core.getInput('ssh_private_key');
    const sitePath = core.getInput('site_path');

    const sshKeyPath = path.join(os.tmpdir(), 'deploy_key');

    // Vérifier que la clé privée n'est pas vide
    if (!sshPrivateKey || sshPrivateKey.trim().length === 0) {
      throw new Error('La clé privée est vide ou invalide.');
    }

    console.log('Clé privée brute (debug, 50 premiers caractères) :', sshPrivateKey.slice(0, 50) + '...');

    // Corriger les retours à la ligne et supprimer les espaces inutiles
    const sanitizedKey = sshPrivateKey
      .replace(/\r\n/g, '\n')
      .replace(/\n\n+/g, '\n')
      .trim();

    // Écrire la clé dans un fichier temporaire
    try {
      fs.writeFileSync(sshKeyPath, sanitizedKey, { mode: 0o600 });
      console.log(`Clé SSH temporaire écrite dans : ${sshKeyPath}`);
    } catch (error) {
      console.error('Erreur lors de l’écriture du fichier clé SSH :', error.message);
      process.exit(1);
    }

    // Vérifier si la clé est valide avec ssh-keygen
    try {
      const testKeyCommand = `ssh-keygen -l -f ${sshKeyPath}`;
      execSync(testKeyCommand, { stdio: 'inherit' });
      console.log('Clé privée validée par ssh-keygen.');
    } catch (error) {
      console.error('Erreur lors de la validation de la clé avec ssh-keygen :', error.message);
      throw new Error('La clé privée semble invalide ou corrompue.');
    }

    const debugCommand = `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no ${sshUser}@${sshHost} echo "Connexion test manuelle réussie"`;
    console.log('Commande SSH de test manuel :', debugCommand);

    try {
      execSync(debugCommand, { stdio: 'inherit' });
      console.log('Test SSH manuel réussi.');
    } catch (error) {
      console.error('Test SSH manuel échoué :', error.message);
      throw error;
    }
  } catch (error) {
    console.error('Erreur générale :', error.message);
    process.exit(1);
  }
}

deploy();
