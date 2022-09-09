/** eslint-disable */
import '@testing-library/cypress/add-commands';
import 'cypress-wait-until';

Cypress.Commands.add('getImage', (name) => {
  return Promise.resolve(location.origin + '/public/image/' + name);
});

// puppeteer commands

Cypress.Commands.add('initPuppeteer', () => {
  return cy.task('initPuppeteer');
});

Cypress.Commands.add('assignWindows', () => {
  return cy.task('assignWindows');
});

// metamask commands

Cypress.Commands.add('confirmMetamaskWelcomePage', () => {
  return cy.task('confirmMetamaskWelcomePage');
});

Cypress.Commands.add('importMetamaskWallet', (secretWords, password = 'Tester@1234') => {
  return cy.task('importMetamaskWallet', { secretWords, password });
});

Cypress.Commands.add('addMetamaskNetwork', (network) => {
  return cy.task('addMetamaskNetwork', network);
});

Cypress.Commands.add('changeMetamaskNetwork', (network) => {
  return cy.task('changeMetamaskNetwork', network);
});

Cypress.Commands.add('getMetamaskWalletAddress', () => {
  cy.task('getMetamaskWalletAddress').then((address) => {
    return address;
  });
});

Cypress.Commands.add('switchToCypressWindow', () => {
  return cy.task('switchToCypressWindow');
});

Cypress.Commands.add('switchToMetamaskWindow', () => {
  return cy.task('switchToMetamaskWindow');
});

Cypress.Commands.add('activateCustomNonceInMetamask', () => {
  return cy.task('activateCustomNonceInMetamask');
});

Cypress.Commands.add('resetMetamaskAccount', () => {
  return cy.task('resetMetamaskAccount');
});

Cypress.Commands.add('disconnectMetamaskWalletFromDapp', () => {
  return cy.task('disconnectMetamaskWalletFromDapp');
});

Cypress.Commands.add('disconnectMetamaskWalletFromAllDapps', () => {
  return cy.task('disconnectMetamaskWalletFromAllDapps');
});

Cypress.Commands.add('confirmMetamaskSignatureRequest', () => {
  return cy.task('confirmMetamaskSignatureRequest');
});

Cypress.Commands.add('rejectMetamaskSignatureRequest', () => {
  return cy.task('rejectMetamaskSignatureRequest');
});

Cypress.Commands.add('confirmMetamaskPermissionToSpend', () => {
  return cy.task('confirmMetamaskPermissionToSpend');
});

Cypress.Commands.add('rejectMetamaskPermissionToSpend', () => {
  return cy.task('rejectMetamaskPermissionToSpend');
});

Cypress.Commands.add('acceptMetamaskAccess', () => {
  return cy.task('acceptMetamaskAccess');
});

Cypress.Commands.add('acceptMetamaskSwitch', (config) => {
  return cy.task('acceptMetamaskSwitch', config);
});

Cypress.Commands.add('confirmMetamaskTransaction', () => {
  return cy.task('confirmMetamaskTransaction');
});

Cypress.Commands.add('rejectMetamaskTransaction', () => {
  return cy.task('rejectMetamaskTransaction');
});

Cypress.Commands.add('switchToMetamaskNotification', () => {
  return cy.task('switchToMetamaskNotification');
});

Cypress.Commands.add('unlockMetamask', (password = 'qwertyuiop') => {
  return cy.task('unlockMetamask', password);
});

Cypress.Commands.add('fetchMetamaskWalletAddress', () => {
  cy.task('fetchMetamaskWalletAddress').then((address) => {
    return address;
  });
});

Cypress.Commands.add('setupMetamask', (secretWordsOrPrivateKey, network, password = 'qwertyuiop') => {
  return cy.task('setupMetamask', { secretWordsOrPrivateKey, network, password });
});

Cypress.Commands.add('getNetwork', () => {
  return cy.task('getNetwork');
});

Cypress.Commands.add('activeMetamask', () => {
  cy.setupMetamask(
    'add, door, once, guide, nest, upper, minute, donkey, liar, wool, reflect, satisfy',
    'ropsten',
    'qwertyuiop'
  );
});

// SNX commands

Cypress.Commands.add('snxExchangerSettle', (asset, walletAddress, privateKey) => {
  return cy.task('snxExchangerSettle', { asset, walletAddress, privateKey }, { timeout: 300000 });
});

Cypress.Commands.add('snxCheckWaitingPeriod', (asset, walletAddress) => {
  return cy.task('snxCheckWaitingPeriod', { asset, walletAddress }, { timeout: 200000 });
});

// etherscan commands

Cypress.Commands.add('etherscanGetTransactionStatus', (txid) => {
  return cy.task('etherscanGetTransactionStatus', { txid }, { timeout: 30000 });
});

Cypress.Commands.add('etherscanWaitForTxSuccess', (txid) => {
  return cy.task('etherscanWaitForTxSuccess', { txid }, { timeout: 120000 });
});

Cypress.Commands.add('waitForResources', (resources = []) => {
  const globalTimeout = 60000;
  const resourceCheckInterval = 2000;
  const idleTimesInit = 3;
  let idleTimes = idleTimesInit;
  let resourcesLengthPrevious;
  let timeout;

  return new Cypress.Promise((resolve, reject) => {
    const checkIfResourcesLoaded = () => {
      const resourcesLoaded = cy
        // @ts-ignore
        .state('window')
        .performance.getEntriesByType('resource')
        .filter((r) => !['script', 'xmlhttprequest'].includes(r.initiatorType));

      const allFilesFound = resources.every((resource) => {
        const found = resourcesLoaded.filter((resourceLoaded) => {
          return resourceLoaded.name.includes(resource.name);
        });
        if (found.length === 0) {
          return false;
        }
        return !resource.number || found.length >= resource.number;
      });

      if (allFilesFound) {
        if (resourcesLoaded.length === resourcesLengthPrevious) {
          idleTimes--;
        } else {
          idleTimes = idleTimesInit;
          resourcesLengthPrevious = resourcesLoaded.length;
        }
      }
      if (!idleTimes) {
        resolve();
        return;
      }

      timeout = setTimeout(checkIfResourcesLoaded, resourceCheckInterval);
    };

    checkIfResourcesLoaded();
    setTimeout(() => {
      reject();
      clearTimeout(timeout);
    }, globalTimeout);
  });
});

Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  originalFn(url, options);
  // @ts-ignore
  return cy.waitForResources();
});

// for unit tests
Cypress.Commands.add('waitForReactComponent', () => {
  return cy.waitForReact(3000, '#__cy_root');
});

// cross-chain commands
Cypress.Commands.add('submitTx', () => {
  return cy.get('.cy-submit').contains('Transfer').click();
});

Cypress.Commands.add('confirmTx', () => {
  return cy.get('.ant-modal-confirm-btns button').contains('Confirm').click();
});

Cypress.Commands.add('checkTxResult', (text, href, timeout = 60 * 1000) => {
  return cy
    .get('.ant-modal-confirm-content', { timeout })
    .find('a')
    .should('have.text', text)
    .then((ele) => expect(ele.attr('href')).to.match(href));
});

Cypress.Commands.add('agreeAndContinue', () => {
  return cy.get('button').contains('Agree and Continue').click();
});

Cypress.Commands.add('selectFromToken', (chain, symbol) => {
  return cy
    .get('.ant-form-item-control-input-content button')
    .first()
    .click()
    .then(() => cy.get('.ant-radio-group label').contains(chain).click())
    .then(() => cy.get('button span').contains(symbol).click());
});

Cypress.Commands.add('selectToToken', (chain, symbol) => {
  return cy
    .get('.ant-form-item-control-input-content button')
    .eq(1)
    .click()
    .then(() => cy.get('.helix-modal:nth-child(2) .ant-radio-group label').contains(chain).last().click())
    .then(() => cy.get('.helix-modal:nth-child(2) button span').contains(symbol).click());
});

Cypress.Commands.add('connectToWallet', () => {
  return cy.get('.ant-btn-default').contains('Connect to Wallet').click();
});

Cypress.Commands.add('typeAmount', (amount: string) => {
  return cy.get('input[role="spinbutton"]').first().type(amount);
});

Cypress.Commands.add('typeRecipient', (recipient: string) => {
  return cy.get('input[placeholder="Type or select the recipient address"]').type(recipient);
});
