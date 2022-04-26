import { RegisterStatus } from '@helix/shared/config/constant';
import {
  CrossChainComponentProps,
  DVMChainConfig,
  PolkadotChainConfig,
  CrossChainDirection,
  MappingToken,
  DailyLimit,
} from '@helix/shared/model';
import { getS2SMappingAddress, entrance, waitUntilConnected, fromWei } from '@helix/shared/utils';
import { Codec } from '@polkadot/types/types';
import { last } from 'lodash';
import { useCallback, useEffect } from 'react';
import { from, switchMap } from 'rxjs';
import { DVM } from '../DVM';
import { useBridgeStatus } from './hooks';
import { RedeemSubstrateTxPayload, SubstrateDVM2SubstratePayload } from './model';
import { redeem } from './utils/tx';

export function SubstrateDVM2Substrate({
  form,
  setSubmit,
  direction,
  setBridgeState,
}: CrossChainComponentProps<SubstrateDVM2SubstratePayload, DVMChainConfig, PolkadotChainConfig>) {
  const bridgeState = useBridgeStatus(direction);

  const transform = useCallback(
    (value: RedeemSubstrateTxPayload) => {
      const { to } = direction;

      return from(getS2SMappingAddress(value.direction.from.provider.rpc)).pipe(
        switchMap((mappingAddress) => redeem(value, mappingAddress, String(to.specVersion)))
      );
    },
    [direction]
  );

  const getSpender = useCallback(async (dir: CrossChainDirection) => {
    const mappingAddress = await getS2SMappingAddress(dir.from.provider.rpc);

    return mappingAddress;
  }, []);

  const getDailyLimit = useCallback(
    async (_: MappingToken) => {
      const { to: arrival } = direction;
      const api = entrance.polkadot.getInstance(arrival.provider.rpc);

      await waitUntilConnected(api);

      // TODO: querying should rely on token info.
      const module = arrival.isTest ? 'substrate2SubstrateBacking' : 'toCrabBacking';
      const [spentToday, limit] = (await api.query[module].secureLimitedRingAmount()).toJSON() as [number, number];

      return { spentToday, limit } as DailyLimit;
    },
    [direction]
  );

  const getFee = useCallback(async ({ to: arrival, from: departure }: CrossChainDirection) => {
    const api = entrance.polkadot.getInstance(departure.provider.rpc);

    await waitUntilConnected(api);

    const section = arrival.isTest ? `${arrival.name}FeeMarket` : 'feeMarket';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const module = api.query[section] as any;
    const res = (await module.assignedRelayers().then((data: Codec) => data.toJSON())) as {
      id: string;
      collateral: number;
      fee: number;
    }[];
    const num = fromWei({ value: last(res)?.fee.toString(), decimals: 9 });

    return num;
  }, []);

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  return (
    <DVM
      form={form}
      direction={direction}
      setSubmit={setSubmit}
      transform={transform}
      canRegister={false}
      spenderResolver={getSpender}
      tokenRegisterStatus={RegisterStatus.registered}
      approveOptions={{ gas: '21000000', gasPrice: '50000000000' }}
      getDailyLimit={getDailyLimit}
      getFee={getFee}
      isDVM={false}
    />
  );
}
