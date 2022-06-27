import { render } from '@testing-library/react';
import { SubscanLink } from '../../components/widget/SubscanLink';
import { pangolinConfig } from '../../config/network';
import { pangolinDVMConfig } from '../../config/network/pangolin-dvm';

describe('<SubscanLink />', () => {
  it('should contains right account address', () => {
    const { getByRole, queryByText } = render(
      <SubscanLink network={pangolinConfig} address="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/account/0x123456');
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });

  it('[DVM] should contains right account address', () => {
    const { getByRole, queryByText } = render(
      <SubscanLink network={pangolinDVMConfig} address="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/account/0x123456');
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });

  it('[DVM] should contains right account address by network name', () => {
    const { getByRole, queryByText } = render(
      <SubscanLink network="pangolin-dvm" address="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/account/0x123456');
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });

  it('should contains right extrinsic link by extrinsic height and index', () => {
    const { getByRole } = render(
      <SubscanLink network={pangolinConfig} extrinsic={{ height: 10389, index: 3 }}>
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/extrinsic/10389-3');
  });

  it('[DVM] should contains right extrinsic link by extrinsic height and index', () => {
    const { getByRole } = render(
      <SubscanLink network={pangolinDVMConfig} extrinsic={{ height: 10389, index: 3 }}>
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/extrinsic/10389-3');
  });

  it('[DVM] should contains right extrinsic link by extrinsic height, index and network name', () => {
    const { getByRole } = render(
      <SubscanLink network="pangolin-dvm" extrinsic={{ height: 10389, index: 3 }}>
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/extrinsic/10389-3');
  });

  it('should contains right extrinsic link by tx hash', () => {
    const { getByRole } = render(
      <SubscanLink network={pangolinConfig} txHash="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/extrinsic/0x123456');
  });

  it('[DVM] should contains right extrinsic link by tx hash for dvm chains', () => {
    const { getByRole } = render(
      <SubscanLink network={pangolinDVMConfig} txHash="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/extrinsic/0x123456');
  });

  it('[DVM] should contains right extrinsic link by tx hash and network name for dvm chains ', () => {
    const { getByRole } = render(
      <SubscanLink network="pangolin-dvm" txHash="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/extrinsic/0x123456');
  });

  it('should contains right block address', () => {
    const { getByRole, queryByText } = render(
      <SubscanLink network={pangolinConfig} block="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/block/0x123456');
    expect(queryByText(/test link/i)).toBeInTheDocument();
  });

  it('[DVM] should contains right block address', () => {
    const { getByRole, queryByText } = render(
      <SubscanLink network={pangolinDVMConfig} block="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/block/0x123456');
    expect(queryByText(/test link/i)).toBeInTheDocument();
  });

  it('[DVM] should contains right block address by network name', () => {
    const { getByRole, queryByText } = render(
      <SubscanLink network="pangolin-dvm" block="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/block/0x123456');
    expect(queryByText(/test link/i)).toBeInTheDocument();
  });

  it('should display the block address default', () => {
    const { getByRole, queryByText } = render(<SubscanLink network={pangolinConfig} block="0x123456"></SubscanLink>);

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/block/0x123456');
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });

  it('[DVM] should display the block address default', () => {
    const { getByRole, queryByText } = render(<SubscanLink network={pangolinDVMConfig} block="0x123456"></SubscanLink>);

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/block/0x123456');
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });

  it('[DVM] should display the block address default by network name', () => {
    const { getByRole, queryByText } = render(<SubscanLink network="pangolin-dvm" block="0x123456"></SubscanLink>);

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/block/0x123456');
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });
});
