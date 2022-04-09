import { useMemo } from 'react';
import { EllipsisMiddle } from '../widget/EllipsisMiddle';
import { Network, NetworkMode, PolkadotChainConfig } from '../../model';
import { convertToSS58, getChainConfigByName, isPolkadotNetwork } from '../../utils';

interface PartyProps {
  account: string;
  chain: Network;
  mode: NetworkMode;
  showName?: boolean;
  className?: string;
  copyable?: boolean;
}

export function Party({ chain, account, mode, copyable = false, showName = true, className = '' }: PartyProps) {
  const address = useMemo(() => {
    if (isPolkadotNetwork(chain) && mode !== 'dvm') {
      const config = getChainConfigByName(chain) as PolkadotChainConfig;

      return convertToSS58(account, config.ss58Prefix);
    }

    return account;
  }, [account, chain, mode]);

  return (
    <div className={`flex flex-col max-w-xs ${className}`}>
      {showName && <span className="capitalize">{chain}</span>}
      <EllipsisMiddle copyable={copyable}>{address}</EllipsisMiddle>
    </div>
  );
}
