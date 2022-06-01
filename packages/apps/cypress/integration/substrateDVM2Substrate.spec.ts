/// <reference types="cypress" />

describe('Substrate DVM to Substrate', () => {
  const TOKEN_NAME = 'xORING';
  const { pangolinDVM: sender, pangoro: recipient } = Cypress.env('accounts');
  const hrefRegExp = /^https:\/\/pangolin.subscan.io\/extrinsic\/0x\w+$/;

  before(() => {
    cy.activeMetamask();
  });

  beforeEach(() => {
    cy.visit(Cypress.config().baseUrl);
  });

  it('approve before launch tx', () => {
  });

  it('should launch tx', () => {
  });
});
