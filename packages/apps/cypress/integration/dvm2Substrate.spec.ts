/// <reference types="cypress" />

describe('DVM to main net', () => {
  const { pangolin: recipient } = Cypress.env('accounts');
  const hrefRegExp = /^https:\/\/pangolin.subscan.io\/extrinsic\/0x\w+$/;

  before(() => {
    cy.activeMetamask();
  });

  beforeEach(() => {
    cy.visit(Cypress.config().baseUrl);
    cy.waitForReact();
    cy.agreeAndContinue();
  });

  it('should launch ring tx', () => {
    const chai = { networkName: 'pangolin', networkId: 43, isTestnet: true };
    cy.selectFromToken('Pangolin Smart Chain', 'PRING');
    cy.selectToToken('Pangolin', 'PRING');

    cy.connectToWallet(chai).then(() => {
      cy.acceptMetamaskSwitch(chai);
      cy.acceptMetamaskSwitch(chai);
    });

    cy.typeAmount('1');

    cy.get('.ant-radio-button-wrapper').first().click();

    cy.typeRecipient(recipient);
    cy.submitTx();
    cy.confirmTx();

    cy.wait(5000);
    cy.confirmMetamaskTransaction();

    cy.checkTxResult('View in Subscan explorer', hrefRegExp);
  });
});
