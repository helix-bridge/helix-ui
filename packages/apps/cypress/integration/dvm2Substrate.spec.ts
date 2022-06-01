/// <reference types="cypress" />

describe('DVM to main net', () => {
  const { pangolinDVM: sender, pangolin: recipient } = Cypress.env('accounts');
  const hrefRegExp = /^https:\/\/pangolin.subscan.io\/extrinsic\/0x\w+$/;

  before(() => {
    // cy.activeMetamask();
  });

  beforeEach(() => {
    cy.visit(Cypress.config().baseUrl);
    cy.waitForReact();
    cy.agreeAndContinue();
  });

  it('should launch ring tx', () => {
    cy.selectFromToken('Pangolin Smart Chain', 'PRING');
    cy.selectToToken('Pangolin', 'PRING');
    cy.connectToWallet({ networkName: 'pangolin', networkId: 43, isTestnet: true });
    cy.typeAmount('1');

    // cy.react('RecipientItem').find('input').type(recipient);
  });

  // it('should launch kton tx', () => {});
});
