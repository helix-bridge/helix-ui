import { TokenWithBridgesInfo, CrossOverview } from 'shared/model';

export const isTransferableTokenPair = (token1: TokenWithBridgesInfo, token2: TokenWithBridgesInfo): boolean => {
  const check = (token: TokenWithBridgesInfo) => (item: CrossOverview) =>
    item.partner.name === token.host && item.partner.symbol === token.symbol;

  const inToken1 = check(token1);
  const inToken2 = check(token2);
  const overviewList1 = token1.cross.filter(inToken2);
  const overviewList2 = token2.cross.filter(inToken1);

  return !!overviewList1.length && !!overviewList2.length;
};
