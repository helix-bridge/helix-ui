import { PauseCircleOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { BridgeStatus, CrossChainDirection, CustomFormControlProps, HashInfo } from 'shared/model';
import { getBridge, patchUrl, updateStorage } from 'shared/utils';
import { Destination } from './Destination';

type DirectionProps = CustomFormControlProps<CrossChainDirection> & { initial: CrossChainDirection };

export function Direction({ value, initial, onChange }: DirectionProps) {
  const data = value ?? initial;
  const { t } = useTranslation();
  const [bridgetStatus, setBridgetStatus] = useState<null | BridgeStatus>(null);

  const triggerChange = useCallback(
    (val: CrossChainDirection) => {
      if (onChange) {
        onChange(val);
      }
    },
    [onChange]
  );

  useEffect(() => {
    const { from, to } = data;
    const info = {
      from: from.name,
      to: to.name,
      fMode: from.meta.mode,
      tMode: to.meta.mode,
    } as HashInfo;

    if (from && to) {
      const bridge = getBridge({ from, to });

      setBridgetStatus(bridge.status);
    } else {
      setBridgetStatus(null);
    }

    patchUrl(info);
    updateStorage(info);
  }, [data]);

  return (
    <div className={`relative flex justify-between items-center flex-col`}>
      <Destination
        title={t('From')}
        value={data.from}
        onChange={(from) => {
          triggerChange({ from, to: data.to });
        }}
        className="pr-4"
      />

      {bridgetStatus === 'pending' ? (
        <PauseCircleOutlined className="w-10 h-10 mx-auto" />
      ) : (
        <Icon
          onClick={() => {
            const { from, to } = data;

            triggerChange({ from: { ...to, amount: '' }, to: { ...from, amount: '' } });
          }}
          name="switch"
          className="w-10 h-10 mx-auto transform rotate-90"
        />
      )}

      <Destination
        title={t('To')}
        value={data.to}
        disabled
        onChange={(to) => {
          triggerChange({ to, from: data.from });
        }}
        className="pr-4"
      />
    </div>
  );
}
