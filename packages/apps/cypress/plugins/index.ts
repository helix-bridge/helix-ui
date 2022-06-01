/** eslint-disable */
/// <reference types="cypress" />

const path = require('path');
const helpers = require('./helpers');
const puppeteer = require('./puppeteer');
const metamask = require('./metamask');
const synthetix = require('./synthetix');
const etherscan = require('./etherscan');
const Timeout = require('await-timeout');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: any, config: any) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('before:browser:launch', async (browser, launchOptions) => {
    // metamask welcome screen blocks cypress from loading
    if (browser.name === 'chrome') {
      launchOptions.args.push(
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      );
    }

    if (process.env.TEST_TYPE === 'e2e') {
      // NOTE: extensions cannot be loaded in headless Chrome
      const metamaskPath = await helpers.prepareMetamask(process.env.METAMASK_VERSION || '9.7.1');
      launchOptions.extensions.push(metamaskPath);
      await Timeout.set(2000);
    }
    
    return launchOptions;
  });
  on('task', {
    error(message) {
      console.error('\u001B[31m', 'ERROR:', message, '\u001B[0m');
      return true;
    },
    warn(message) {
      console.warn('\u001B[33m', 'WARNING:', message, '\u001B[0m');
      return true;
    },
    initPuppeteer: async () => {
      const connected = await puppeteer.init();
      return connected;
    },
    clearPuppeteer: async () => {
      const cleared = await puppeteer.clear();
      return cleared;
    },
    assignWindows: async () => {
      const assigned = await puppeteer.assignWindows();
      return assigned;
    },
    clearWindows: async () => {
      const cleared = await puppeteer.clearWindows();
      return cleared;
    },
    switchToCypressWindow: async () => {
      const switched = await puppeteer.switchToCypressWindow();
      return switched;
    },
    switchToMetamaskWindow: async () => {
      const switched = await puppeteer.switchToMetamaskWindow();
      return switched;
    },
    switchToMetamaskNotification: async () => {
      const notificationPage = await puppeteer.switchToMetamaskNotification();
      return notificationPage;
    },
    confirmMetamaskWelcomePage: async () => {
      const confirmed = await metamask.confirmWelcomePage();
      return confirmed;
    },
    unlockMetamask: async (password) => {
      const unlocked = await metamask.unlock(password);
      return unlocked;
    },
    importMetamaskWallet: async ({ secretWords, password }) => {
      if (process.env.SECRET_WORDS) {
        secretWords = process.env.SECRET_WORDS;
      }
      const imported = await metamask.importWallet(secretWords, password);
      return imported;
    },
    addMetamaskNetwork: async (network) => {
      const networkAdded = await metamask.addNetwork(network);
      return networkAdded;
    },
    changeMetamaskNetwork: async (network) => {
      network = network ?? process.env.NETWORK_NAME ?? 'ropsten';
      const networkChanged = await metamask.changeNetwork(network);
      return networkChanged;
    },
    activateCustomNonceInMetamask: async () => {
      const activated = await metamask.activateCustomNonce();
      return activated;
    },
    resetMetamaskAccount: async () => {
      const resetted = await metamask.resetAccount();
      return resetted;
    },
    disconnectMetamaskWalletFromDapp: async () => {
      const disconnected = await metamask.disconnectWalletFromDapp();
      return disconnected;
    },
    disconnectMetamaskWalletFromAllDapps: async () => {
      const disconnected = await metamask.disconnectWalletFromAllDapps();
      return disconnected;
    },
    confirmMetamaskSignatureRequest: async () => {
      const confirmed = await metamask.confirmSignatureRequest();
      return confirmed;
    },
    rejectMetamaskSignatureRequest: async () => {
      const rejected = await metamask.rejectSignatureRequest();
      return rejected;
    },
    confirmMetamaskPermissionToSpend: async () => {
      const confirmed = await metamask.confirmPermissionToSpend();
      return confirmed;
    },
    rejectMetamaskPermissionToSpend: async () => {
      const rejected = await metamask.rejectPermissionToSpend();
      return rejected;
    },
    acceptMetamaskAccess: async () => {
      const accepted = await metamask.acceptAccess();
      return accepted;
    },
    acceptMetamaskSwitch: async (config: { networkName: string; networkId: number; isTestnet: boolean}) => {
      const accepted = await metamask.acceptSwitch(config);
      return accepted;
    },
    confirmMetamaskTransaction: async () => {
      const confirmed = await metamask.confirmTransaction();
      return confirmed;
    },
    rejectMetamaskTransaction: async () => {
      const rejected = await metamask.rejectTransaction();
      return rejected;
    },
    getMetamaskWalletAddress: async () => {
      const walletAddress = await metamask.getWalletAddress();
      return walletAddress;
    },
    fetchMetamaskWalletAddress: async () => {
      return metamask.walletAddress();
    },
    setupMetamask: async ({ secretWordsOrPrivateKey, network = 'kovan', password }) => {
      if (process.env.NETWORK_NAME) {
        network = process.env.NETWORK_NAME;
      }
      if (process.env.PRIVATE_KEY) {
        secretWordsOrPrivateKey = process.env.PRIVATE_KEY;
      }
      if (process.env.SECRET_WORDS) {
        secretWordsOrPrivateKey = process.env.SECRET_WORDS;
      }
      await metamask.initialSetup({
        secretWordsOrPrivateKey,
        network,
        password,
      });
      return true;
    },
    snxExchangerSettle: async ({ asset, walletAddress, privateKey }) => {
      if (process.env.PRIVATE_KEY) {
        privateKey = process.env.PRIVATE_KEY;
      }
      const settled = await synthetix.settle({
        asset,
        walletAddress,
        privateKey,
      });
      // todo: wait for confirmation?
      return settled;
    },
    snxCheckWaitingPeriod: async ({ asset, walletAddress }) => {
      const waitingPeriod = await synthetix.checkWaitingPeriod({
        asset,
        walletAddress,
      });
      return waitingPeriod;
    },
    getNetwork: () => {
      const network = helpers.getNetwork();
      return network;
    },
    etherscanGetTransactionStatus: async ({ txid }) => {
      const txStatus = await etherscan.getTransactionStatus(txid);
      return txStatus;
    },
    etherscanWaitForTxSuccess: async ({ txid }) => {
      const txSuccess = await etherscan.waitForTxSuccess(txid);
      return txSuccess;
    },
  });

  if (process.env.BASE_URL) {
    config.baseUrl = process.env.BASE_URL;
  }

  if (process.env.CI) {
    config.retries.runMode = 1;
    config.retries.openMode = 1;
  }

  return config;
};
