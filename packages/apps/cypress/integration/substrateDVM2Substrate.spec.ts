/// <reference types="cypress" />

describe('Substrate DVM to Substrate', () => {
  const { pangoro: recipient } = Cypress.env('accounts');
  const hrefRegExp = /^https:\/\/pangolin.subscan.io\/extrinsic\/0x\w+$/;
  const chain = { networkName: 'pangolin', networkId: 43, isTestnet: true };

  before(() => {
    cy.activeMetamask();
  });

  beforeEach(() => {
    cy.visit(Cypress.config().baseUrl);
    cy.agreeAndContinue();
  });

  after(() => {
    cy.changeMetamaskNetwork('ropsten');
  });

  it.skip('approve before launch tx', () => {
    cy.selectFromToken('Pangolin Smart Chain', 'xORING');
    cy.selectToToken('Pangoro', 'ORING');

    cy.connectToWallet().then(() => {
      cy.acceptMetamaskSwitch(chain);
      cy.acceptMetamaskSwitch(chain);
    });

    cy.typeAmount('0.1');

    cy.get('.ant-radio-button-wrapper').first().click();

    cy.typeRecipient(recipient);

    cy.get('.cy-approve').click();

    cy.confirmTx();

    cy.wait(5000);
    cy.confirmMetamaskPermissionToSpend();

    cy.get('.ant-message', { timeout: 1 * 60 * 1000 })
      .find('a')
      .should('have.text', 'View in Etherscan explorer');
  });

  it('should launch xORing tx', () => {
    cy.selectFromToken('Pangolin Smart Chain', 'xORING');
    cy.selectToToken('Pangoro', 'ORING');

    cy.connectToWallet().then(() => {
      cy.acceptMetamaskSwitch(chain);
    });

    cy.typeAmount('0.1');

    cy.get('.ant-radio-button-wrapper').first().click();

    cy.typeRecipient(recipient);

    cy.contains(/\d+(\.?(?=\d+)\d+)?\sPRING/);

    cy.submitTx();
    cy.confirmTx();
    cy.wait(5000);
    cy.confirmMetamaskTransaction();

    // cy.checkTxResult('View in Subscan explorer', hrefRegExp);
  });
});
