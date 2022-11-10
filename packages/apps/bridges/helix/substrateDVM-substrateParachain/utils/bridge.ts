import type { Codec } from '@polkadot/types-codec/types';
import { BN, hexToU8a } from '@polkadot/util';
import { message } from 'antd';
import { BigNumber, Contract } from 'ethers/lib/ethers';
import last from 'lodash/last';
import omit from 'lodash/omit';
import upperFirst from 'lodash/upperFirst';
import type { Observable } from 'rxjs/internal/Observable';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { from as fromRx } from 'rxjs/internal/observable/from';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import {
  ChainConfig,
  CrossChainDirection,
  CrossToken,
  DVMChainConfig,
  HelixHistoryRecord,
  ParachainChainConfig,
  Tx,
} from 'shared/model';
import { entrance, isMetamaskChainConsistent, waitUntilConnected } from 'shared/utils/connection';
import { convertToDvm, revertAccount } from 'shared/utils/helper/address';
import { toWei } from 'shared/utils/helper/balance';
import { genEthereumContractTxObs, signAndSendExtrinsic } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { getOriginChainConfig } from '../../../../utils/network';
import { getDirectionFromHelixRecord } from '../../../../utils/record';
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
    const WEIGHT = 6e8;
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals }));

    return genEthereumContractTxObs(
      this.config.contracts.backing,
      (contract) =>
        contract.lockAndRemoteIssuing(
          to.meta.specVersion.toString(),
          WEIGHT,
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
    const WEIGHT = 400e8;
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

  refund(record: HelixHistoryRecord): Observable<Tx> {
    const { fromChain, toChain, messageNonce } = record;
    const config = getOriginChainConfig(fromChain);

    if (this.isIssue(fromChain, toChain)) {
      const contract = new Contract(
        this.config.contracts.backing,
        backingAbi,
        entrance.web3.getInstance(config.provider.https)
      );

      return fromRx(contract.minReservedLockedMessageNonce() as Promise<BigNumber>).pipe(
        switchMap((msgNonce) =>
          Number(messageNonce) < msgNonce.toNumber()
            ? this.localUnlockFailure(record)
            : this.remoteUnlockFailure(record)
        )
      );
    } else {
      const api = entrance.polkadot.getInstance(config.provider.wss);
      const section = `from${upperFirst(config.name.split('-')[0])}Issuing`;

      return fromRx(waitUntilConnected(api)).pipe(
        switchMap(() => api.query[section].minReservedBurnNonce()),
        switchMap((res: Codec) =>
          Number(messageNonce) < Number(res.toHuman())
            ? this.localIssuingFailure(record)
            : this.remoteIssuingFailure(record)
        )
      );
    }
  }

  private localUnlockFailure(record: HelixHistoryRecord) {
    const { fromChain, messageNonce } = record;

    return isMetamaskChainConsistent(getOriginChainConfig(fromChain)).pipe(
      switchMap(() =>
        genEthereumContractTxObs(
          this.config.contracts.backing,
          (contract) => contract.handleUnlockFailureLocal(messageNonce),
          backingAbi
        )
      )
    );
  }

  private remoteUnlockFailure(record: HelixHistoryRecord) {
    const dir = getDirectionFromHelixRecord(record) as CrossChainDirection<
      CrossToken<DVMChainConfig>,
      CrossToken<ParachainChainConfig>
    >;

    if (!dir) {
      message.error('Can not revert the transfer from record, processing terminated!');
      return EMPTY;
    }

    const api = entrance.polkadot.getInstance(dir.to.meta.provider.wss);
    const section = `from${upperFirst(dir.to.meta.name.split('-')[0])}Issuing`;
    const WEIGHT = 400e8;
    const gaslimit = 1e6;
    const recipient = revertAccount(record.recipient, dir.to.meta);

    const extrinsic = fromRx(waitUntilConnected(api)).pipe(
      switchMap(() =>
        this.getFee({ from: dir.to, to: dir.from }).then((fee) =>
          api.tx[section].remoteUnlockFailure(
            String(dir.from.meta.specVersion),
            WEIGHT,
            gaslimit,
            record.messageNonce,
            fee.amount.toString()
          )
        )
      )
    );

    return fromRx(extrinsic).pipe(switchMap((ext) => signAndSendExtrinsic(api, recipient, ext)));
  }

  private localIssuingFailure(record: HelixHistoryRecord) {
    const fromConfig = getOriginChainConfig(record.fromChain) as ParachainChainConfig;
    const api = entrance.polkadot.getInstance(fromConfig.provider.wss);
    const section = `from${upperFirst(fromConfig.name.split('-')[0])}Issuing`;

    return fromRx(waitUntilConnected(api)).pipe(
      switchMap(() =>
        signAndSendExtrinsic(api, record.sender, api.tx[section].handleIssuingFailureLocal(record.messageNonce))
      )
    );
  }

  private remoteIssuingFailure(record: HelixHistoryRecord) {
    const toChain = getOriginChainConfig(record.toChain) as ParachainChainConfig;
    const fromChain = getOriginChainConfig(record.fromChain) as ParachainChainConfig;
    const WEIGHT = 6e8;
    const dir = getDirectionFromHelixRecord(record);

    if (!dir) {
      message.error('Can not revert the transfer from record, processing terminated!');
      return EMPTY;
    }

    return isMetamaskChainConsistent(toChain).pipe(
      switchMap(() => this.getFee({ from: dir.to, to: dir.from })),
      switchMap(({ amount: fee }) =>
        genEthereumContractTxObs(
          this.config.contracts.backing,
          (contract) =>
            contract.remoteIssuingFailure(String(fromChain.specVersion), WEIGHT, record.messageNonce, {
              value: fee.add(new BN(record.sendAmount)).toString(),
            }),
          backingAbi
        )
      )
    );
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<TokenWithAmount> {
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
