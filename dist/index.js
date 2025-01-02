/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 469:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 317:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const core = __nccwpck_require__(469);
const { execSync } = __nccwpck_require__(317);

async function deploy() {
  try {
    const sshHost = core.getInput('ssh_host');
    const sshUser = core.getInput('ssh_user');
    const sitePath = core.getInput('site_path');

    console.log('Déploiement en cours...');
    const rsyncCommand = `
      rsync -avz --delete-excluded --exclude='.git*' -e "ssh -o StrictHostKeyChecking=no" ./ ${sshUser}@${sshHost}:${sitePath}/
    `;
    execSync(rsyncCommand, { stdio: 'inherit' });

    console.log('Déploiement terminé avec succès.');
  } catch (error) {
    console.error('Erreur pendant le déploiement :', error.message);
    process.exit(1);
  }
}

deploy();

module.exports = __webpack_exports__;
/******/ })()
;