import type { Codec } from '@polkadot/types-codec/types';
import { BN, BN_ZERO, hexToU8a, stringToHex } from '@polkadot/util';
import { BigNumber, Contract } from 'ethers';
import last from 'lodash/last';
import { Observable } from 'rxjs';
import { from } from 'rxjs/internal/observable/from';
import { zip } from 'rxjs/internal/observable/zip';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import {
  BridgeName,
  ChainConfig,
  CrossChainDirection,
  CrossToken,
  DailyLimit,
  DVMChainConfig,
  PolkadotChainConfig,
  Tx,
} from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { fromWei, toWei } from 'shared/utils/helper/balance';
import { isRing } from 'shared/utils/helper/validator';
import { isDVMNetwork } from 'shared/utils/network/network';
import { genEthereumContractTxObs, signAndSendExtrinsic } from 'shared/utils/tx';
import { Bridge } from '../../../../core/bridge';
import { TxValidation } from '../../../../model';
import abi from '../config/abi.json';
import { IssuingPayload, RedeemPayload, SubstrateSubstrateDVMBridgeConfig } from '../model';
import { getS2SMappingAddress } from './mappingParams';

export class SubstrateSubstrateDVMBridge extends Bridge<
  SubstrateSubstrateDVMBridgeConfig,
  PolkadotChainConfig,
  DVMChainConfig
> {
  static supportBridges: BridgeName[] = ['substrate-substrateDVM'];

  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction } = payload;
    const { from: departure, to } = direction;
    const api = entrance.polkadot.getInstance(direction.from.meta.provider);
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).sub(fee).toString();
    const WEIGHT = '4000000000';
    const section = departure.meta.isTest ? 'substrate2SubstrateBacking' : 'toCrabBacking';
    const extrinsic = api.tx[section].lockAndRemoteIssue(String(to.meta.specVersion), WEIGHT, amount, fee, recipient);

    return signAndSendExtrinsic(api, sender, extrinsic);
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    const {
      sender,
      recipient,
      direction: { from: departure, to },
    } = payload;
    const receiver = hexToU8a(convertToDvm(recipient));
    const WEIGHT = '690133000';
    const api = entrance.polkadot.getInstance(departure.meta.provider);

    const valObs = from(waitUntilConnected(api)).pipe(
      switchMap(() => this.getFee(payload.direction)),
      map((res) => {
        const num = fromWei({ value: res, decimals: 9 });

        return stringToHex(toWei({ value: num }));
      })
    );

    return zip([valObs, getS2SMappingAddress(departure.meta.provider)]).pipe(
      switchMap(([val, mappingAddress]) =>
        genEthereumContractTxObs(
          mappingAddress,
          (contract) =>
            contract.burnAndRemoteUnlockWaitingConfirm(
              to.meta.specVersion.toString,
              WEIGHT,
              departure.address,
              receiver,
              toWei({ value: departure.amount, decimals: departure.decimals }),
              { from: sender, value: val }
            ),
          abi
        )
      )
    );
  }

  async getDailyLimit(
    direction: CrossChainDirection<
      CrossToken<PolkadotChainConfig | DVMChainConfig>,
      CrossToken<PolkadotChainConfig | DVMChainConfig>
    >
  ): Promise<DailyLimit | null> {
    const {
      to: { meta: arrival, address: ringAddress },
    } = direction;
    const mappingAddress = await getS2SMappingAddress(arrival.provider);
    const contract = new Contract(mappingAddress, abi, entrance.web3.currentProvider);
    const tokenAddress = isRing(direction.from.symbol) ? ringAddress : '';

    if (!tokenAddress) {
      return null;
    }

    const limit: BigNumber = await contract.dailyLimit(tokenAddress);
    const spentToday: BigNumber = await contract.spentToday(tokenAddress);

    return { limit: limit.toString(), spentToday: spentToday.toString() };
  }

  async getFee(
    direction: CrossChainDirection<
      CrossToken<PolkadotChainConfig | DVMChainConfig>,
      CrossToken<PolkadotChainConfig | DVMChainConfig>
    >
  ): Promise<BN> {
    const { from: departure, to } = direction;
    const res = await this.queryFeeFromRelayers(departure.meta, to.meta);

    const marketFee = last(res)?.fee.toString();

    return new BN(marketFee ?? -1); // -1: fee market does not available
  }

  genTxParamsValidations({ balance, dailyLimit, amount, fee, allowance }: TxValidation): [boolean, string][] {
    return [
      [balance.lt(amount), this.txValidationMessages.balanceLessThanAmount],
      [!!dailyLimit && dailyLimit.lt(amount), this.txValidationMessages.dailyLimitLessThanAmount],
      [!!allowance && allowance?.lt(amount), this.txValidationMessages.allowanceLessThanAmount],
      [!!fee && fee?.lt(BN_ZERO), this.txValidationMessages.invalidFee],
    ];
  }

  private async queryFeeFromRelayers(departure: ChainConfig, to: ChainConfig) {
    const api = entrance.polkadot.getInstance(departure.provider);
    const section = isDVMNetwork(departure.name) || to.isTest ? `${to.name.split('-')[0]}FeeMarket` : 'feeMarket';

    await waitUntilConnected(api);

    return api.query[section]['assignedRelayers']().then((data: Codec) => data.toJSON()) as Promise<
      {
        id: string;
        collateral: number;
        fee: number;
      }[]
    >;
  }
}
