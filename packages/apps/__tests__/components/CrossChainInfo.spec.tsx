/// <reference types="jest" />

import { Typography } from 'antd';
import { create } from 'react-test-renderer';
import { darwiniaConfig, darwiniaDVMConfig } from 'shared/config/network';
import { BridgeConfig, ContractConfig, ChainConfig, CrossChainDirection } from 'shared/model';
import { isRing } from 'shared/utils/helper/validator';
import { darwiniaDarwiniaDVM } from '../../bridges/helix/substrate-dvm/config';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { Bridge } from '../../core/bridge';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('<CrossChainInfo />', () => {
  const fromToken = darwiniaConfig.tokens.find((item) => isRing(item.symbol))!;
  const toToken = darwiniaDVMConfig.tokens.find((item) => isRing(item.symbol))!;
  const direction: CrossChainDirection = {
    from: { ...fromToken, meta: darwiniaConfig, amount: '8' },
    to: { ...toToken, meta: darwiniaDVMConfig, amount: '8' },
  };
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('render cross-chain item', () => {
    const component = create(
      <CrossChainInfo
        bridge={darwiniaDarwiniaDVM as Bridge<BridgeConfig<ContractConfig>, ChainConfig, ChainConfig>}
        direction={direction}
        fee={{ amount: 8, symbol: 'RING' }}
      />
    );

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('render cross-chain with children', () => {
    const component = create(
      <CrossChainInfo
        bridge={darwiniaDarwiniaDVM as Bridge<BridgeConfig<ContractConfig>, ChainConfig, ChainConfig>}
        direction={direction}
        fee={{ amount: 8, symbol: 'RING' }}
      >
        <span>can receive children node</span>
      </CrossChainInfo>
    );

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('render cross-chain and extra nodes', () => {
    const component = create(
      <CrossChainInfo
        bridge={darwiniaDarwiniaDVM as Bridge<BridgeConfig<ContractConfig>, ChainConfig, ChainConfig>}
        direction={direction}
        fee={{ amount: 8, symbol: 'RING' }}
        extra={[
          {
            name: 'Allowance',
            content: (
              <Typography.Text className="capitalize">
                <span>10000000</span>
                <span className="capitalize ml-1">PRING</span>
              </Typography.Text>
            ),
          },
          {
            name: 'Daily limit',
            content: (
              <Typography.Text className="capitalize">
                <span>100000000</span>
                <span className="capitalize ml-1">PRING</span>
              </Typography.Text>
            ),
          },
        ]}
      ></CrossChainInfo>
    );

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('render cross-chain with dynamic fee', () => {
    const component = create(
      <CrossChainInfo
        bridge={darwiniaDarwiniaDVM as Bridge<BridgeConfig<ContractConfig>, ChainConfig, ChainConfig>}
        direction={direction}
        isDynamicFee
      />
    );

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
