# Deploy to VPS Action

Automate the deployment of your websites or web applications on your VPS by using this GitHub Action. Whenever you push an update into your GitHub repository, this Action automatically synchronizes the files on your VPS, simplifying your deployments and reducing errors.

---

## **Features**
- Automatic deployment at every `git push` on a specified branch.
- Secure connection via SSH.
- Synchronizing files with `rsync`, including deleting obsolete files.
- Quick and easy configuration.

---

## **Requirements**
Before you begin, make sure that:
1. You have a **VPS** configured with a web server (e.g. Apache, Nginx).
2. You have generated an SSH key pair and added the public key on your VPS.
3. You have a GitHub repository containing your site or application.

---

## **Configuration**

### 1. Add the Action to your workflow
Create a file `.github/workflows/deploy.yml' in your GitHub repository and add the following example:

```yaml
name: Deploy to VPS

on:
push:
branches:
- hand

jobs:
deploy:
runs-on: ubuntu-latest

steps:
- name: Checkout code
uses: actions/checkout@v3

- name: Add SSH Private Key
  run: |
   mkdir -p ~/.ssh
   echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
   chmod 600 ~/.ssh/id_rsa
   ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
   cat ~/.ssh/id_rsa # Debug : Vérifiez que la clé est correcte
   cat ~/.ssh/known_hosts # Debug : Vérifiez les hôtes connus

- name: Deploy to VPS
uses: your-username/your-action-repo@v1
with:
ssh_host: ${{ secrets.SSH_HOST }}
ssh_user: ${{ secrets.SSH_USER }}
ssh_private_key: ${{ secrets.SSH_PRIVATE_KEY }}
site_path: /var/www/html
```

### 2. Configure GitHub secrets

Add the necessary secrets to your GitHub repository:

- `SSH_HOST` : IP address or domain name of your VPS.
- `SSH_USER`: SSH user configured to access the VPS.
- `SSH_PRIVATE_KEY`: SSH private key corresponding to the public key configured on the VPS.

### 3. Confirm configuration

Add the necessary secrets to your GitHub repository:

- `SSH_HOST`: Do a `git push` in your main branch (`main` or other, depending on your configuration).
- `SSH_USER`: Check that the Action is executed correctly in the `Actions` tab of your GitHub repository.
- `SSH_PRIVATE_KEY`: Your site or application will be automatically synchronized on the specified path (`site_path`).

## **How it works**

1. The Action clones the code of your GitHub repository.
2. It establishes a secure connection via SSH with your VPS.
3. Files are synchronized with your VPS using `rsync`.
4. Obsolete files are deleted, and your site is immediately up to date.

## **Customizable options**

You can modify the following settings in your `deploy.yml` workflow:

- `ssh_host`: VPS address.
- `ssh_user`: Username for SSH.
- `site_path`: Target path on the VPS where the files will be deployed.
