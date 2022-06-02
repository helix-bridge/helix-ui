/// <reference types="cypress" />

describe('DVM to main net', () => {
  const { pangolin: recipient } = Cypress.env('accounts');
  const hrefRegExp = /^https:\/\/pangolin.subscan.io\/extrinsic\/0x\w+$/;

  before(() => {
    cy.activeMetamask();
  });

  beforeEach(() => {
    cy.visit(Cypress.config().baseUrl);
    cy.agreeAndContinue();
  });
  
  it('Just to accept metamask access', () => {
    cy.selectFromToken('Ropsten', 'PRING');
    cy.get('.ant-btn-default').contains('Connect to Wallet').click();
    cy.acceptMetamaskAccess(); // allow metamask connect;
  });

  it.skip('should launch ring tx', () => {
    const chain = { networkName: 'pangolin', networkId: 43, isTestnet: true };
 
    cy.selectFromToken('Pangolin Smart Chain', 'PRING');
    cy.selectToToken('Pangolin', 'PRING');

    cy.connectToWallet().then(() => {
      cy.acceptMetamaskSwitch(chain);
      cy.acceptMetamaskSwitch(chain);
    });

    cy.typeAmount('1');

    cy.get('.ant-radio-button-wrapper').first().click();

    cy.typeRecipient(recipient);
    cy.submitTx();
    cy.confirmTx();

    cy.wait(5000);
    cy.confirmMetamaskTransaction();

    // cy.checkTxResult('View in Subscan explorer', hrefRegExp);
  });
});
