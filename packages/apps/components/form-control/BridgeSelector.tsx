import { Select } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';
import { BridgeBase } from 'shared/core/bridge';
import { BridgeConfig, ChainConfig, ContractConfig, CrossChainDirection, CustomFormControlProps } from 'shared/model';
import { getBridges } from 'utils/bridge';
import { bridgeFactory } from '../../bridges/bridges';
import { Bridge } from '../../core/bridge';

type BridgeSelectorProps = CustomFormControlProps<Bridge<BridgeConfig, ChainConfig, ChainConfig>> & {
  direction: CrossChainDirection;
};

export function BridgeSelector({ direction, value, onChange }: BridgeSelectorProps) {
  const bridges = useMemo(() => {
    const configs = getBridges(direction);

    return configs.map((config) => bridgeFactory(config));
  }, [direction]);

  const isDisabled = useCallback<(bridge: BridgeBase) => boolean>(
    // eslint-disable-next-line complexity
    (bridge: BridgeBase) => {
      return (
        !!direction.from &&
        !!direction.to &&
        ((bridge.disableIssue && bridge.isIssue(direction.from.meta, direction.to.meta)) ||
          (bridge.disableRedeem && bridge.isRedeem(direction.from.meta, direction.to.meta)))
      );
    },
    [direction.from, direction.to]
  );

  // eslint-disable-next-line complexity
  useEffect(() => {
    if (bridges.length && onChange) {
      const defaultBridge = bridges.find((item) => item.isDefault) || bridges[0];
      if (!isDisabled(defaultBridge)) {
        onChange(defaultBridge);
      }
    }
  }, [bridges, isDisabled, onChange, value]);

  return (
    <Select
      onChange={(name: string) => {
        const target: Bridge<BridgeConfig<ContractConfig>, ChainConfig, ChainConfig> = bridges.find(
          (item) => item.name === name
        )!;

        if (onChange) {
          onChange(target);
        }
      }}
      value={value?.name}
    >
      {bridges.map((item) => (
        <Select.Option key={item.name} value={item.name}>
          {item.category === 'helix'
            ? 'helix(Legacy)'
            : item.category === 'helixLpBridge'
            ? 'helix(Fusion)'
            : item.category}
        </Select.Option>
      ))}
    </Select>
  );
}
