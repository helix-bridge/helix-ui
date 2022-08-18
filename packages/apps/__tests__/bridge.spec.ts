/// <reference types="jest" />

import { bridgeCategoryDisplay } from '../utils/bridge';

describe('record utils', () => {
  it('Should correct bridge category name', () => {
    expect(bridgeCategoryDisplay('helix')).toBe('Helix');
    expect(bridgeCategoryDisplay('cBridge')).toBe('cBridge');
  });
});
