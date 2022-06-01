/// <reference types="cypress" />

describe('Ethereum to Darwinia', () => {
  const { pangolin: recipient, ropsten: sender } = Cypress.env('accounts');
  const hrefRegExp = /^https:\/\/ropsten.etherscan.io\/tx\/0x\w+$/;

  before(() => {
    cy.activeMetamask();
  });

  beforeEach(() => {
    cy.visit(Cypress.config().baseUrl);
  });

  it('should launch ring tx', () => {
  });

  it('should launch kton tx', () => {
  });
});
