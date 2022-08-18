import { render } from '@testing-library/react';
import React from 'react';
import { SubscanLink } from '../../components/widget/SubscanLink';
import { knownParachainNetworks, SYSTEM_CHAIN_CONFIGURATIONS } from '../../config/network';
import { knownDVMNetworks, knownPolkadotNetworks } from '../../config/network';
import { DVMNetwork, Network, ParachainNetwork, PolkadotTypeNetwork } from '../../model';
import { isParachainNetwork, isPolkadotNetwork } from '../../utils/network';

describe('<SubscanLink />', () => {
  const dvmConfigs = SYSTEM_CHAIN_CONFIGURATIONS.filter((item) => knownDVMNetworks.includes(item.name as DVMNetwork));

  const parachainConfigs = SYSTEM_CHAIN_CONFIGURATIONS.filter((item) =>
    knownParachainNetworks.includes(item.name as ParachainNetwork)
  );

  const polkadotConfigs = SYSTEM_CHAIN_CONFIGURATIONS.filter(
    (item) => isPolkadotNetwork(item) && !isParachainNetwork(item)
  );

  const ethereumConfigs = SYSTEM_CHAIN_CONFIGURATIONS.filter(
    (item) =>
      !knownDVMNetworks.includes(item.name as DVMNetwork) &&
      !knownPolkadotNetworks.includes(item.name as PolkadotTypeNetwork)
  );

  it.each(polkadotConfigs)('[Subscan - $name] should contains right account address', (config) => {
    const { getByRole, queryByText } = render(
      <SubscanLink network={config} address="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', `https://${config.name}.subscan.io/account/0x123456`);
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });

  it.each(dvmConfigs)('[DVM - $name] should contains right account address', (dvmConfig) => {
    const { getByRole, queryByText } = render(
      <SubscanLink network={dvmConfig} address="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute(
      'href',
      `https://${dvmConfig.name.split('-')[0]}.subscan.io/account/0x123456`
    );
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });

  it.each(knownDVMNetworks)('[DVM - %s] should contains right account address by network name', (network) => {
    const { getByRole, queryByText } = render(
      <SubscanLink network={network} address="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', `https://${network.split('-')[0]}.subscan.io/account/0x123456`);
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });

  it.each(parachainConfigs)('[Parachain - %s] should contains right account address by network name', (config) => {
    const { getByRole, queryByText } = render(
      <SubscanLink network={config} address="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute(
      'href',
      `https://${config.name.split('-')[0]}.subscan.io/account/0x123456`
    );
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });

  /*--------------------------------------------------by extrinsic-------------------------------------------------------*/

  it.each(polkadotConfigs)(
    '[Subscan - $name] should contains right extrinsic link by extrinsic height and index',
    (config) => {
      const { getByRole } = render(
        <SubscanLink network={config} extrinsic={{ height: 10389, index: 3 }}>
          test link
        </SubscanLink>
      );

      expect(getByRole('link')).toHaveAttribute('href', `https://${config.name}.subscan.io/extrinsic/10389-3`);
    }
  );

  it.each(dvmConfigs)('[DVM - $name] should contains right extrinsic link by extrinsic height and index', (config) => {
    const { getByRole } = render(
      <SubscanLink network={config} extrinsic={{ height: 10389, index: 3 }}>
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute(
      'href',
      `https://${config.name.split('-')[0]}.subscan.io/extrinsic/10389-3`
    );
  });

  it.each(knownDVMNetworks)(
    '[DVM - %s] should contains right extrinsic link by extrinsic height, index and network name',
    (network) => {
      const { getByRole } = render(
        <SubscanLink network={network} extrinsic={{ height: 10389, index: 3 }}>
          test link
        </SubscanLink>
      );

      expect(getByRole('link')).toHaveAttribute(
        'href',
        `https://${network.split('-')[0]}.subscan.io/extrinsic/10389-3`
      );
    }
  );

  it.each(knownParachainNetworks)(
    '[Parachain - %s] should contains right extrinsic link by extrinsic height, index and network name',
    (network) => {
      const { getByRole } = render(
        <SubscanLink network={network} extrinsic={{ height: 10389, index: 3 }}>
          test link
        </SubscanLink>
      );

      expect(getByRole('link')).toHaveAttribute(
        'href',
        `https://${network.split('-')[0]}.subscan.io/extrinsic/10389-3`
      );
    }
  );

  /*-----------------------------------------------------by txHash----------------------------------------------------*/

  it.each(polkadotConfigs)('[Subscan - $name] should contains right extrinsic link by tx hash', (config) => {
    const { getByRole } = render(
      <SubscanLink network={config} txHash="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', `https://${config.name}.subscan.io/tx/0x123456`);
  });

  it.each(dvmConfigs)('[DVM - $name] should contains right extrinsic link by tx hash for dvm chains', (config) => {
    const { getByRole } = render(
      <SubscanLink network={config} txHash="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', `https://${config.name.split('-')[0]}.subscan.io/tx/0x123456`);
  });

  it.each(knownDVMNetworks)(
    '[DVM - %s] should contains right extrinsic link by tx hash and network name for dvm chains ',
    (network) => {
      const { getByRole } = render(
        <SubscanLink network={network} txHash="0x123456">
          test link
        </SubscanLink>
      );

      expect(getByRole('link')).toHaveAttribute('href', `https://${network.split('-')[0]}.subscan.io/tx/0x123456`);
    }
  );

  it.each(parachainConfigs)(
    '[Parachain - %s] should contains right extrinsic link by tx hash and network name for parachain ',
    (config) => {
      const { getByRole } = render(
        <SubscanLink network={config} txHash="0x123456">
          test link
        </SubscanLink>
      );

      expect(getByRole('link')).toHaveAttribute('href', `https://${config.name.split('-')[0]}.subscan.io/tx/0x123456`);
    }
  );

  it.each(ethereumConfigs)('[Etherscan - $name] should contains right extrinsic link by tx hash', (config) => {
    const { getByRole } = render(
      <SubscanLink network={config} txHash="0x123456">
        test link
      </SubscanLink>
    );
    const href = `https://${config.name === 'ethereum' ? '' : config.name + '.'}etherscan.io/tx/0x123456`;

    const explorers: Partial<{ [key in Network]: string }> = {
      heco: `https://hecoinfo.com/tx/0x123456`,
      polygon: `https://polygonscan.com/tx/0x123456`,
    };
    const expected = explorers[config.name] ?? href;

    expect(getByRole('link')).toHaveAttribute('href', expected);
  });

  /*-------------------------------------------block hash--------------------------------------------------------------*/

  it.each(polkadotConfigs)('[Subscan - $name] should contains right block address', (config) => {
    const { getByRole, queryByText } = render(
      <SubscanLink network={config} block="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', `https://${config.name}.subscan.io/block/0x123456`);
    expect(queryByText(/test link/i)).toBeInTheDocument();
  });

  it.each(dvmConfigs)('[DVM - $name] should contains right block address', (config) => {
    const { getByRole, queryByText } = render(
      <SubscanLink network={config} block="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', `https://${config.name.split('-')[0]}.subscan.io/block/0x123456`);
    expect(queryByText(/test link/i)).toBeInTheDocument();
  });

  it.each(knownDVMNetworks)('[DVM - %s] should contains right block address by network name', (network) => {
    const { getByRole, queryByText } = render(
      <SubscanLink network={network} block="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', `https://${network.split('-')[0]}.subscan.io/block/0x123456`);
    expect(queryByText(/test link/i)).toBeInTheDocument();
  });

  it.each(parachainConfigs)('[Parachain - $name] should contains right block address', (config) => {
    const { getByRole, queryByText } = render(
      <SubscanLink network={config} block="0x123456">
        test link
      </SubscanLink>
    );

    expect(getByRole('link')).toHaveAttribute('href', `https://${config.name.split('-')[0]}.subscan.io/block/0x123456`);
    expect(queryByText(/test link/i)).toBeInTheDocument();
  });

  /*-------------------------------------------default address--------------------------------------------------------------*/

  it.each(polkadotConfigs)('[Subscan - $name] should display the block address default', (config) => {
    const { getByRole, queryByText } = render(<SubscanLink network={config} block="0x123456"></SubscanLink>);

    expect(getByRole('link')).toHaveAttribute('href', `https://${config.name}.subscan.io/block/0x123456`);
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });

  it.each(dvmConfigs)('[DVM - $name] should display the block address default', (config) => {
    const { getByRole, queryByText } = render(<SubscanLink network={config} block="0x123456"></SubscanLink>);

    expect(getByRole('link')).toHaveAttribute('href', `https://${config.name.split('-')[0]}.subscan.io/block/0x123456`);
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });

  it.each(knownDVMNetworks)('[DVM - %s] should display the block address default by network name', (network) => {
    const { getByRole, queryByText } = render(<SubscanLink network={network} block="0x123456"></SubscanLink>);

    expect(getByRole('link')).toHaveAttribute('href', `https://${network.split('-')[0]}.subscan.io/block/0x123456`);
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });

  it.each(parachainConfigs)('[Parachain - $name] should display the block address default', (config) => {
    const { getByRole, queryByText } = render(<SubscanLink network={config} block="0x123456"></SubscanLink>);

    expect(getByRole('link')).toHaveAttribute('href', `https://${config.name.split('-')[0]}.subscan.io/block/0x123456`);
    expect(queryByText(/0x123456/i)).toBeInTheDocument();
  });
});
