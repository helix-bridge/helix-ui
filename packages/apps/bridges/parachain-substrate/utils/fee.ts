import { Codec } from '@polkadot/types-codec/types';
import { hexToU8a } from '@polkadot/util';
import BN from 'bn.js';
import { last, lowerFirst, upperFirst } from 'lodash';
import { Bridge, ChainConfig } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';

const queryFeeFromRelayers = async (from: ChainConfig, to: ChainConfig) => {
  const api = entrance.polkadot.getInstance(from.provider);
  const section = lowerFirst(`${to.name.split('-').map(upperFirst).join('')}FeeMarket`);

  await waitUntilConnected(api);

  return api.query[section]['assignedRelayers']().then((data: Codec) => data.toJSON()) as Promise<
    {
      id: string;
      collateral: number;
      fee: number;
    }[]
  >;
};

async function getFee(from: ChainConfig, to: ChainConfig): Promise<BN> {
  const res = await queryFeeFromRelayers(from, to);

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
