/// <reference types="cypress" />

describe('Substrate DVM to Substrate', () => {
  const { pangoro: recipient } = Cypress.env('accounts');
  const hrefRegExp = /^https:\/\/pangolin.subscan.io\/extrinsic\/0x\w+$/;

  before(() => {
    cy.activeMetamask();
  });

  beforeEach(() => {
    cy.visit(Cypress.config().baseUrl);
    cy.waitForReact();
    cy.agreeAndContinue();
  });

  it('approve before launch tx', () => {
    const chain = { networkName: 'pangolin', networkId: 43, isTestnet: true };

    cy.selectFromToken('Pangolin Smart Chain', 'xORING');
    cy.selectToToken('Pangoro', 'ORING');

    cy.connectToWallet().then(() => {
      cy.acceptMetamaskSwitch(chain);
    });

    cy.typeAmount('0.1');

    cy.get('.ant-radio-button-wrapper').first().click();

    cy.typeRecipient(recipient);

    cy.get('.cy-approve').click();

    cy.confirmTx();

    cy.confirmMetamaskPermissionToSpend();
  });

  it('should launch xORing tx', () => {
    cy.selectFromToken('Pangolin Smart Chain', 'xORING');
    cy.selectToToken('Pangoro', 'ORING');

    cy.connectToWallet();

    cy.typeAmount('0.1');

    cy.get('.ant-radio-button-wrapper').first().click();

    cy.typeRecipient(recipient);

    cy.contains(/\d+\sPRING/);

    cy.submitTx();
    cy.confirmTx();
    
    cy.confirmMetamaskTransaction();
  });
});
