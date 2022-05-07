import BN from 'bn.js';
import { abi } from 'shared/config/abi';
import { Bridge } from 'shared/model';
import { entrance, getChainConfig, waitUntilConnected } from 'shared/utils';
import Web3 from 'web3';
import { EthereumDarwiniaBridgeConfig } from '../model';

export async function getRedeemFee(bridge: Bridge<EthereumDarwiniaBridgeConfig>): Promise<BN | null> {
  const to = getChainConfig(bridge.issuing[1]);
  const api = entrance.polkadot.getInstance(to.provider);

  await waitUntilConnected(api);

  const fee = api.consts.ethereumBacking.advancedFee.toString();

  return Web3.utils.toBN(fee || 0);
}

export async function getRedeemTxFee(
  bridge: Bridge<EthereumDarwiniaBridgeConfig>,
  params: {
    recipient: string;
    sender: string;
    amount: number;
  }
): Promise<BN> {
  const to = getChainConfig(bridge.issuing[1]);
  const api = entrance.polkadot.getInstance(to.provider);

  await waitUntilConnected(api);

  const { recipient, sender, amount = 0 } = params;
  const extrinsic = api.tx.balances.transfer(recipient, new BN(amount));

  return await extrinsic.paymentInfo(sender).then((info) => new BN(info.partialFee ?? 0));
}

export async function getIssuingFee(bridge: Bridge<EthereumDarwiniaBridgeConfig>): Promise<BN | null> {
  const from = getChainConfig(bridge.issuing[0]);
  const web3 = entrance.web3.getInstance(from.provider);
  const contract = new web3.eth.Contract(abi.registryABI, bridge.config.contracts?.fee);
  const fee: number = await contract.methods
    .uintOf('0x55494e545f4252494447455f4645450000000000000000000000000000000000')
    .call();

  return web3.utils.toBN(fee || 0);
}
