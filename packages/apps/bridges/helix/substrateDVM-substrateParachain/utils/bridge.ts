import type { Codec } from '@polkadot/types-codec/types';
import { BN, hexToU8a } from '@polkadot/util';
import { Contract } from 'ethers';
import last from 'lodash/last';
import omit from 'lodash/omit';
import upperFirst from 'lodash/upperFirst';
import type { Observable } from 'rxjs';
import { ChainConfig, CrossChainDirection, CrossToken, Tx } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { toWei } from 'shared/utils/helper/balance';
import { genEthereumContractTxObs, signAndSendExtrinsic } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import backingAbi from '../config/abi.json';
import { IssuingPayload, RedeemPayload, SubstrateDVMSubstrateParachainBridgeConfig } from '../model';

export class SubstrateDVMSubstrateParachainBridge extends Bridge<
  SubstrateDVMSubstrateParachainBridgeConfig,
  ChainConfig,
  ChainConfig
> {
  static readonly alias: string = 'SubstrateDVMSubstrateParachainBridge';

  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction } = payload;
    const { from: departure, to } = direction;
    const weight = 6e8;
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals }));

    return genEthereumContractTxObs(
      this.config.contracts.backing,
      (contract) =>
        contract.lockAndRemoteIssuing(
          to.meta.specVersion.toString(),
          weight,
          convertToDvm(recipient),
          amount.toString(),
          { from: sender, value: amount.add(fee).toString() }
        ),
      backingAbi
    );
  }

  burn(payload: RedeemPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction } = payload;
    const { from: departure, to } = direction;
    const api = entrance.polkadot.getInstance(direction.from.meta.provider.wss);
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals }));
    const WEIGHT = 10e8;
    const gaslimit = 1e6;
    const section = `from${upperFirst(to.meta.name.split('-')[0])}Issuing`;
    const extrinsic = api.tx[section].burnAndRemoteUnlock(
      String(to.meta.specVersion),
      WEIGHT,
      gaslimit,
      amount.toString(),
      fee,
      recipient
    );

    return signAndSendExtrinsic(api, sender, extrinsic);
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<TokenWithAmount | null> {
    const { from, to } = direction;
    const token = omit(direction.from, ['meta', 'amount']);

    try {
      if (this.isIssue(from.host, to.host)) {
        const contract = new Contract(
          this.config.contracts.backing as string,
          backingAbi,
          entrance.web3.getInstance(from.meta.provider.https)
        );
        const fee = await contract.currentFee();

        return { ...token, amount: new BN(fee.toString()) };
      } else {
        const api = entrance.polkadot.getInstance(from.meta.provider.https);
        const section = `${to.meta.name.split('-')[0]}FeeMarket`;

        await waitUntilConnected(api);

        const res = (await api.query[section]['assignedRelayers']().then((data: Codec) => data.toJSON())) as {
          id: string;
          collateral: number;
          fee: number;
        }[];

        const data = last(res)?.fee.toString();
        const marketFee = data?.startsWith('0x') ? hexToU8a(data) : data;

        return { ...token, amount: new BN(marketFee ?? -1) } as TokenWithAmount; // -1: fee market does not available
      }
    } catch {
      return { ...token, amount: new BN(-1) } as TokenWithAmount; // -1: fee market does not available
    }
  }

  getMinimumFeeTokenHolding(direction: CrossChainDirection): TokenWithAmount | null {
    const { from: dep } = direction;

    return { ...dep, amount: new BN(toWei({ value: 1, decimals: dep.decimals })) };
  }
}
