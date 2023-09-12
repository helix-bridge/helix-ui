import { CSSProperties, PropsWithChildren } from 'react';
import { ChainConfig, Network } from '../../model';
import { isDVMNetwork, isPolkadotNetwork } from '../../utils/network/network';
import { Copy, CopyProps } from './TextWithCopy';

interface ExplorerLinkProps extends PropsWithChildren<unknown> {
  address?: string;
  block?: string;
  className?: string;
  copyable?: boolean;
  extrinsic?: { height: string | number; index: number | string };
  network: Network | ChainConfig;
  style?: CSSProperties;
  txHash?: string;
}

function Wrapper({ children, content, copyable }: PropsWithChildren<CopyProps & { copyable?: boolean }>) {
  return copyable ? (
    <span className="space-x-2">
      {children}
      <Copy content={content} />
    </span>
  ) : (
    <>{children}</>
  );
}

// eslint-disable-next-line complexity
export function ExplorerLink({
  network: networkOrChainConfig,
  address,
  extrinsic,
  children,
  copyable,
  block,
  txHash,
  ...other
}: ExplorerLinkProps) {
  let network: Network = typeof networkOrChainConfig === 'object' ? networkOrChainConfig.name : networkOrChainConfig;
  const isSubscan = isPolkadotNetwork(network) || isDVMNetwork(network) || network === 'astar';

  if (isDVMNetwork(networkOrChainConfig)) {
    network = network.split('-')[0] as Network;
  }

  if (address) {
    return (
      <Wrapper content={address} copyable={!!copyable}>
        <a
          href={`https://${network}.subscan.io/account/${address}`}
          target="_blank"
          {...other}
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          {address}
        </a>
      </Wrapper>
    );
  }

  if (extrinsic) {
    const { height, index } = extrinsic;
    const content = `${height}-${index}`;

    return (
      <Wrapper content={content} copyable={copyable}>
        <a
          href={`https://${network}.subscan.io/extrinsic/${content}`}
          target="_blank"
          {...other}
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          {children || content}
        </a>
      </Wrapper>
    );
  }

  if (txHash) {
    const omitNetwork: Network[] = ['ethereum'];

    const explorers: Partial<{ [key in Network]: string }> = {
      heco: `https://hecoinfo.com/tx/${txHash}`,
      polygon: `https://polygonscan.com/tx/${txHash}`,
      moonriver: `https://moonriver.moonscan.io/tx/${txHash}`,
      arbitrum: `https://arbiscan.io/tx/${txHash}`,
      optimism: `https://optimistic.etherscan.io/tx/${txHash}`,
      avalanche: `https://snowtrace.io/tx/${txHash}`,
      bsc: `https://bscscan.com/tx/${txHash}`,
      'arbitrum-goerli': `https://goerli.arbiscan.io/tx/${txHash}`,
      'linea-goerli': `https://goerli.lineascan.build/tx/${txHash}`,
      linea: `https://lineascan.build/tx/${txHash}`,
      'zksync-goerli': `https://goerli.explorer.zksync.io/tx/${txHash}`,
      zksync: `https://explorer.zksync.io/tx/${txHash}`,
      mantle: `https://explorer.mantle.xyz/tx/${txHash}`,
      'mantle-goerli': `https://explorer.testnet.mantle.xyz/tx/${txHash}`,
    };

    const href =
      explorers[network] ??
      `https://${omitNetwork.includes(network) ? '' : network + '.'}${
        isSubscan ? 'subscan' : 'etherscan'
      }.io/tx/${txHash}`;

    return (
      <Wrapper content={txHash} copyable={copyable}>
        <a href={href} target="_blank" {...other} onClick={(event) => event.stopPropagation()} rel="noreferrer">
          {children || txHash}
        </a>
      </Wrapper>
    );
  }

  if (block) {
    return (
      <Wrapper content={block} copyable={copyable}>
        <a
          href={`https://${network}.subscan.io/block/${block}`}
          target="_blank"
          {...other}
          onClick={(event) => event.stopPropagation()}
          rel="noreferrer"
        >
          {children || block}
        </a>
      </Wrapper>
    );
  }

  return null;
}
