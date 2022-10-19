interface ApproveOptions {
  gas?: string;
  gasPrice?: string;
  provider?: string;
}

export interface AllowancePayload extends ApproveOptions {
  spender: string;
  tokenAddress: string;
}
