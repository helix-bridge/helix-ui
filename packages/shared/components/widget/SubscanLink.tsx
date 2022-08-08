import { Typography } from 'antd';
import React from 'react';
import { CSSProperties, PropsWithChildren } from 'react';
import { ChainConfig, Network } from '../../model';
import { isDVMNetwork, isPolkadotNetwork } from '../../utils/network';
import { Icon } from './Icon';

const { Link } = Typography;

interface SubscanLinkProps extends PropsWithChildren<unknown> {
  address?: string;
  block?: string;
  className?: string;
  copyable?: boolean;
  extrinsic?: { height: string | number; index: number | string };
  network: Network | ChainConfig;
  style?: CSSProperties;
  txHash?: string;
}

// eslint-disable-next-line complexity
export function SubscanLink({
  network: networkOrChainConfig,
  address,
  extrinsic,
  children,
  copyable,
  block,
  txHash,
  ...other
}: SubscanLinkProps) {
  let network: Network = typeof networkOrChainConfig === 'object' ? networkOrChainConfig.name : networkOrChainConfig;

  if (isDVMNetwork(networkOrChainConfig)) {
    network = network.split('-')[0] as Network;
  }

  if (address) {
    return (
      <Link
        href={`https://${network}.subscan.io/account/${address}`}
        target="_blank"
        copyable={copyable ? { icon: <Icon name="copy1" className="text-base text-white" /> } : false}
        className={`w-full ${copyable ? 'custom-copy-icon' : ''}`}
        underline
      >
        {address}
      </Link>
    );
  }

  if (extrinsic) {
    const { height, index } = extrinsic;

    return (
      <Link href={`https://${network}.subscan.io/extrinsic/${height}-${index}`} target="_blank" {...other}>
        {children}
      </Link>
    );
  }

  if (txHash) {
    const isSubscan = isPolkadotNetwork(network) || isDVMNetwork(network);
    const omitNetwork: Network[] = ['ethereum'];

    const explorers: Partial<{ [key in Network]: string }> = {
      heco: `https://hecoinfo.com/tx/${txHash}`,
      polygon: `https://polygonscan.com/tx/${txHash}`,
    };

    const href =
      explorers[network] ??
      `https://${omitNetwork.includes(network) ? '' : network + '.'}${
        isSubscan ? 'subscan' : 'etherscan'
      }.io/tx/${txHash}`;

    return (
      <Link href={href} target="_blank" {...other}>
        {children}
      </Link>
    );
  }

  if (block) {
    return (
      <Link href={`https://${network}.subscan.io/block/${block}`} target="_blank" {...other}>
        {children || block}
      </Link>
    );
  }

  return null;
}
