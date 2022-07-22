/// <reference types="jest" />

import { Typography } from 'antd';
import { create } from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';
import { pangoroPangolinDVM } from 'shared/config/bridges/substrate-substrateDVM';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('<CrossChainInfo />', () => {
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
    const component = create(<CrossChainInfo bridge={pangoroPangolinDVM} fee={{ amount: '8', symbol: 'PRING' }} />);

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('render cross-chain with children', () => {
    const component = create(
      <CrossChainInfo bridge={pangoroPangolinDVM} fee={{ amount: '8', symbol: 'RING' }}>
        <span>can receive children node</span>
      </CrossChainInfo>
    );

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('render cross-chain and extra nodes', () => {
    const component = create(
      <CrossChainInfo
        bridge={pangoroPangolinDVM}
        fee={{ amount: '8', symbol: 'RING' }}
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
    const component = create(<CrossChainInfo bridge={pangoroPangolinDVM} isDynamicFee />);

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should toggle extra info on click', () => {
    const { getByTestId } = render(
      <CrossChainInfo
        bridge={pangoroPangolinDVM}
        fee={{ amount: '8', symbol: 'RING' }}
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

    expect(getByTestId('Allowance')).toHaveClass('hidden');

    fireEvent.click(getByTestId('toggle-btn'));

    expect(getByTestId('Allowance')).not.toHaveClass('hidden');
  });
});
