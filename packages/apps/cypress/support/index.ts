/// <reference types="cypress" />
import './commands';
import 'cypress-react-selector';
import { configure } from '@testing-library/cypress';

Cypress.on('window:before:load', (window) => {
  Object.defineProperty(window.navigator, 'language', { value: 'en-US' });
  Object.defineProperty(window.navigator, 'languages', { value: ['en'] });
  Object.defineProperty(window.navigator, 'accept_languages', { value: ['en'] });
});

configure({ testIdAttribute: 'data-testid' });

// dont fail tests on uncaught exceptions of websites
Cypress.on('uncaught:exception', () => {
  if (!process.env.FAIL_ON_ERROR) {
    return false;
  }
});

Cypress.on('window:before:load', (win) => {
  cy.stub(win.console, 'error').callsFake((message) => {
    // @ts-ignore
    cy.now('task', 'error', message);
    // fail test on browser console error
    if (process.env.FAIL_ON_ERROR) {
      throw new Error(message);
    }
  });

  cy.stub(win.console, 'warn').callsFake((message) => {
    // @ts-ignore
    cy.now('task', 'warn', message);
  });
});
