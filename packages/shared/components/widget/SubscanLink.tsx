import { Typography } from 'antd';
import { CSSProperties, PropsWithChildren } from 'react';
import { ChainConfig, Network, Vertices } from '../../model';
import { isDarwiniaDVMNetwork, isPolkadotNetwork } from '../../utils/network';

const { Link } = Typography;

interface SubscanLinkProps extends PropsWithChildren<unknown> {
  address?: string;
  block?: string;
  className?: string;
  copyable?: boolean;
  extrinsic?: { height: string | number; index: number | string };
  network: Vertices | ChainConfig;
  style?: CSSProperties;
  txHash?: string;
}

// eslint-disable-next-line complexity
export function SubscanLink({
  network,
  address,
  extrinsic,
  children,
  copyable,
  block,
  txHash,
  ...other
}: SubscanLinkProps) {
  if (address) {
    return (
      <Link
        href={`https://${network.name}.subscan.io/account/${address}`}
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
      <Link href={`https://${network.name}.subscan.io/extrinsic/${height}-${index}`} target="_blank" {...other}>
        {children}
      </Link>
    );
  }

  if (txHash) {
    const isSubscan = isPolkadotNetwork(network) || isDarwiniaDVMNetwork(network);
    const mapObj = isSubscan ? { scan: 'subscan', txPath: 'extrinsic' } : { scan: 'etherscan', txPath: 'tx' };
    const omitNetwork: Network[] = ['ethereum'];

    return (
      <Link
        href={`https://${omitNetwork.includes(network.name) ? '' : network.name + '.'}${mapObj.scan}.io/${
          mapObj.txPath
        }/${txHash}`}
        target="_blank"
        {...other}
      >
        {children}
      </Link>
    );
  }

  if (block) {
    return (
      <Link href={`https://${network.name}.subscan.io/block/${block}`} target="_blank" {...other}>
        {children || block}
      </Link>
    );
  }

  return null;
}
