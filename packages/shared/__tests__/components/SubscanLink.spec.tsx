import { render } from '@testing-library/react';
import { SubscanLink } from '../../components/widget/SubscanLink';
import { pangolinConfig } from '../../config/network';

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

  it('should contains right extrinsic link by extrinsic height and index', () => {
    const { getByRole } = render(
      <SubscanLink network={pangolinConfig} extrinsic={{ height: 10389, index: 3 }}>
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/extrinsic/10389-3');
  });

  it('should contains right extrinsic link by ts hash', () => {
    const { getByRole } = render(
      <SubscanLink network={pangolinConfig} txHash="0x123456">
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

  it('should display the block address default', () => {
    const { getByRole, queryByText } = render(<SubscanLink network={pangolinConfig} block="0x123456"></SubscanLink>);

    expect(getByRole('link')).toHaveAttribute('href', 'https://pangolin.subscan.io/block/0x123456');
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });
});
