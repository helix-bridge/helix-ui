import type { Codec } from '@polkadot/types-codec/types';
import { BN, BN_ZERO, hexToU8a, stringToHex } from '@polkadot/util';
import { BigNumber, Contract } from 'ethers';
import last from 'lodash/last';
import omit from 'lodash/omit';
import { Observable } from 'rxjs';
import { from } from 'rxjs/internal/observable/from';
import { zip } from 'rxjs/internal/observable/zip';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import {
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
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { AllowancePayload } from '../../../../model/allowance';
import abi from '../config/abi.json';
import { IssuingPayload, RedeemPayload, SubstrateSubstrateDVMBridgeConfig } from '../model';

export class SubstrateSubstrateDVMBridge extends Bridge<
  SubstrateSubstrateDVMBridgeConfig,
  PolkadotChainConfig,
  DVMChainConfig
> {
  static readonly alias: string = 'SubstrateSubstrateDVMBridge';

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
        const num = fromWei({ value: res?.amount, decimals: 9 });

        return stringToHex(toWei({ value: num }));
      })
    );

    return zip([valObs, this.s2sMappingAddress(departure.meta.provider)]).pipe(
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
    const mappingAddress = await this.s2sMappingAddress(arrival.provider);
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
  ): Promise<TokenWithAmount | null> {
    const { from: departure, to } = direction;
    const token = omit(direction.from.meta.tokens.find((item) => isRing(item.symbol))!, ['amount', 'meta']);

    if (!isRing(departure.symbol)) {
      return { amount: BN_ZERO, ...token } as TokenWithAmount;
    }

    const res = await this.queryFeeFromRelayers(departure.meta, to.meta);

    const marketFee = last(res)?.fee.toString();

    return { ...token, amount: new BN(marketFee ?? -1) } as TokenWithAmount; // -1: fee market does not available
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

  async getAllowancePayload(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<AllowancePayload> {
    const spender = await this.s2sMappingAddress(direction.from.meta.provider);

    return {
      spender,
      tokenAddress: direction.from.address,
    };
  }

  private async s2sMappingAddress(rpc: string) {
    const api = entrance.polkadot.getInstance(rpc);

    await waitUntilConnected(api);

    const section = rpc.includes('pangolin') ? api.query.substrate2SubstrateIssuing : api.query.fromDarwiniaIssuing;
    const mappingAddress = (await section.mappingFactoryAddress()).toString();

    return mappingAddress;
  }
}
