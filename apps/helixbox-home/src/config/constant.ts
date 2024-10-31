/**
 * If the fee rate is 10.123%, its value in the contract is 10123 (10.123 * FEE_RATE_BASE)
 */
export const FEE_RATE_BASE = 1000;

export const FEE_RATE_MIN = 0;
export const FEE_RATE_MAX = 0.25 * FEE_RATE_BASE; // 0.25%
export const FEE_RATE_MAX_V3 = 100 * FEE_RATE_BASE; // 100%

export const CONFIRMATION_BLOCKS = 2;
