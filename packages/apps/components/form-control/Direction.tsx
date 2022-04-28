import { PauseCircleOutlined } from '@ant-design/icons';
import { isBoolean, negate } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { BridgeStatus, ChainConfig, CustomFormControlProps, HashInfo, NullableCrossChainDirection } from 'shared/model';
import {
  getBridge,
  getChainConfig,
  isChainConfigEqualTo,
  isReachable,
  isTraceable,
  patchUrl,
  truth,
  updateStorage,
} from 'shared/utils';
import { useNetworks } from '../../hooks';
import { Destination } from './Destination';

type DirectionProps = CustomFormControlProps<NullableCrossChainDirection>;

export function Direction({ value, onChange }: DirectionProps) {
  const { t } = useTranslation();
  const { setFromFilters, setToFilters } = useNetworks();
  const [bridgetStatus, setBridgetStatus] = useState<null | BridgeStatus>(null);

  const triggerChange = useCallback(
    (val: NullableCrossChainDirection) => {
      if (onChange) {
        onChange(val);
      }
    },
    [onChange]
  );

  const swap = useCallback(() => {
    triggerChange({
      from: value?.to ?? null,
      to: value?.from ?? null,
    });
  }, [triggerChange, value?.from, value?.to]);

  // eslint-disable-next-line complexity
  useEffect(() => {
    const from = value?.from ? getChainConfig(value.from.name) : null;
    const to = value?.to ? getChainConfig(value.to.name) : null;

    const isSameEnv =
      from?.isTest === to?.isTest
        ? isBoolean(from?.isTest) && isBoolean(to?.isTest)
          ? (net: ChainConfig) => net.isTest === from?.isTest
          : truth
        : (net: ChainConfig) => (isBoolean(from?.isTest) && isBoolean(to?.isTest) ? net.isTest === from?.isTest : true);

    setToFilters([negate(isChainConfigEqualTo(from)), isSameEnv, isReachable(from)]);
    setFromFilters([negate(isChainConfigEqualTo(to)), isSameEnv, isTraceable(to)]);
  }, [value, setFromFilters, setToFilters]);

  // eslint-disable-next-line complexity
  useEffect(() => {
    const { from, to } = value || {};
    const info = {
      from: from?.name ?? '',
      to: to?.name ?? '',
    } as HashInfo;

    if (from && to) {
      const bridge = getBridge({ from, to });

      setBridgetStatus(bridge.status);
    } else {
      setBridgetStatus(null);
    }

    patchUrl(info);
    updateStorage(info);
  }, [value]);

  return (
    <div className={`relative flex justify-between items-center 'flex-col'`}>
      <Destination
        title={t('From')}
        value={value?.from}
        onChange={(from) => {
          triggerChange({ from, to: value?.to ?? null });
        }}
        className="pr-4"
      />

      {bridgetStatus === 'pending' ? (
        <PauseCircleOutlined className="w-10 h-10 mx-auto" />
      ) : (
        <Icon onClick={swap} name="switch" className="w-10 h-10 mx-auto transform rotate-90" />
      )}

      <Destination
        title={t('To')}
        value={value?.to}
        onChange={(to) => {
          triggerChange({ to, from: value?.from ?? null });
        }}
        className="pr-4"
      />
    </div>
  );
}
