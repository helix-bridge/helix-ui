import { Typography } from 'antd';
import { CSSProperties, PropsWithChildren } from 'react';
import { ChainConfig, Network } from '../../model';
import { isDVMNetwork, isPolkadotNetwork } from '../../utils/network';

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
        copyable={copyable}
        className="w-full"
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
    const mapObj = isSubscan ? { scan: 'subscan', txPath: 'extrinsic' } : { scan: 'etherscan', txPath: 'tx' };
    const omitNetwork: Network[] = ['ethereum'];

    const href =
      network === 'heco'
        ? `https://hecoinfo.com/tx/${txHash}`
        : `https://${omitNetwork.includes(network) ? '' : network + '.'}${mapObj.scan}.io/${mapObj.txPath}/${txHash}`;

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
