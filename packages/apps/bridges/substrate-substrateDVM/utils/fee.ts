import { Codec } from '@polkadot/types-codec/types';
import BN from 'bn.js';
import { last } from 'lodash';
import { Bridge } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { getChainConfig } from 'shared/utils/network';

export async function getIssuingFee(bridge: Bridge): Promise<BN> {
  const from = getChainConfig(bridge.issuing[0]);
  const to = getChainConfig(bridge.issuing[1]);
  const api = entrance.polkadot.getInstance(from.provider);
  const section = to.isTest ? `${to.name}FeeMarket` : 'feeMarket';

  await waitUntilConnected(api);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = (await (api.query as any)[section]['assignedRelayers']().then((data: Codec) => data.toJSON())) as {
    id: string;
    collateral: number;
    fee: number;
  }[];

  const marketFee = last(res)?.fee.toString();

  return new BN(marketFee ?? -1); // -1: fee market does not available
}

export const getRedeemFee = getIssuingFee;
