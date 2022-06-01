/// <reference types="cypress" />

describe('Active metamask', () => {
  before(() => {
    cy.activeMetamask();
  });

  beforeEach(() => {
    cy.visit(Cypress.config().baseUrl);
    cy.waitForReact();
    cy.agreeAndContinue();
  });

  it('Just to accept metamask access', () => {
    cy.selectFromToken('Ropsten', 'PRING');
    cy.get('.ant-btn-default').contains('Connect to Wallet').click();
    cy.acceptMetamaskAccess(); // allow metamask connect;
  });
});
