import { Codec } from '@polkadot/types-codec/types';
import BN from 'bn.js';
import { last } from 'lodash';
import { Bridge, ChainConfig } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { isDVMNetwork } from 'shared/utils/network';
import { abi } from '../config';

const queryFeeFromRelayers = async (from: ChainConfig, to: ChainConfig) => {
  const api = entrance.polkadot.getInstance(from.provider);
  const section = isDVMNetwork(from.name) || to.isTest ? `${to.name.split('-')[0]}FeeMarket` : 'feeMarket';

  await waitUntilConnected(api);

  return api.query[section]['assignedRelayers']().then((data: Codec) => data.toJSON()) as Promise<
    {
      id: string;
      collateral: number;
      fee: number;
    }[]
  >;
};

export async function getFee(from: ChainConfig, to: ChainConfig): Promise<BN> {
  const res = await queryFeeFromRelayers(from, to);

  const marketFee = last(res)?.fee.toString();

  return new BN(marketFee ?? -1); // -1: fee market does not available
}

export async function getIssuingFee(): Promise<BN> {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const contract = new web3.eth.Contract(abi.backingAbi);
  const res = await contract.methods.fee().call();

  return res;
}

export async function getRedeemFee(bridge: Bridge): Promise<BN> {
  return getFee(bridge.arrival, bridge.departure);
}
