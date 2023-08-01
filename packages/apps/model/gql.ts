export interface RelayersInfoReq {
  amount: string;
  decimals: number;
  bridge: string;
  token: string;
  fromChain: string;
  toChain: string;
}

export interface RelayersInfoRes {
  sortedLnv20RelayInfos: {
    sendToken: string;
    relayer: string;
    margin: string;
    baseFee: string;
    liquidityFeeRate: number; // 0 ~ 256
    lastTransferId: string;
  }[];
}
