import { Codec } from '@polkadot/types-codec/types';
import { hexToU8a } from '@polkadot/util';
import BN from 'bn.js';
import last from 'lodash/last';
import lowerFirst from 'lodash/lowerFirst';
import upperFirst from 'lodash/upperFirst';
import { Bridge, ChainConfig } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';

async function getFee(from: ChainConfig, to: ChainConfig): Promise<BN> {
  const api = entrance.polkadot.getInstance(from.provider);
  const section = lowerFirst(`${to.name.split('-').map(upperFirst).join('')}FeeMarket`);

  await waitUntilConnected(api);

  const res = (await api.query[section]['assignedRelayers']().then((data: Codec) => data.toJSON())) as {
    id: string;
    collateral: number;
    fee: number;
  }[];

  const data = last(res)?.fee.toString();
  const marketFee = data?.startsWith('0x') ? hexToU8a(data) : data;

  return new BN(marketFee ?? -1); // -1: fee market does not available
}

export async function getIssuingFee(bridge: Bridge): Promise<BN> {
  return getFee(bridge.departure, bridge.arrival);
}

export async function getRedeemFee(bridge: Bridge): Promise<BN> {
  return getFee(bridge.arrival, bridge.departure);
}
