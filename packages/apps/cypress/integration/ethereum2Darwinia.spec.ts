/// <reference types="cypress" />

describe('Ethereum to Darwinia', () => {
  const { pangolin: recipient } = Cypress.env('accounts');
  const hrefRegExp = /^https:\/\/ropsten.etherscan.io\/tx\/0x\w+$/;

  before(() => {
    cy.activeMetamask();
  });

  after(() => { 
    cy.changeMetamaskNetwork('ropsten');
  })

  beforeEach(() => {
    cy.visit(Cypress.config().baseUrl);
    cy.agreeAndContinue();
  });

  it('should launch ring tx', () => {
    cy.selectFromToken('Ropsten', 'PRING');
    cy.selectToToken('Pangolin', 'PRING');

    cy.connectToWallet();

    cy.typeAmount('5.1415926');

    cy.get('.ant-radio-button-wrapper').first().click();

    cy.typeRecipient(recipient);
    cy.submitTx();
    cy.confirmTx();

    cy.wait(5000);
    cy.rejectMetamaskTransaction();
    // cy.confirmMetamaskTransaction();

    // cy.checkTxResult('View in Etherscan explorer', hrefRegExp, 3 * 60 * 1000);
  });

  it('should launch kton tx', () => {
    cy.selectFromToken('Ropsten', 'PKTON');
    cy.selectToToken('Pangolin', 'KTON');

    cy.connectToWallet();

    cy.typeAmount('5.1415926');

    cy.get('.ant-radio-button-wrapper').first().click();

    cy.typeRecipient(recipient);
    cy.submitTx();
    cy.confirmTx();

    cy.wait(5000);
    cy.rejectMetamaskTransaction();
    // cy.confirmMetamaskTransaction();

    // cy.checkTxResult('View in Etherscan explorer', hrefRegExp, 3 * 60 * 1000);
  });
});
