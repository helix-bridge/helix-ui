import { Network, NetworkMode } from '../../model';
import { revertAccount } from '../../utils';
import { EllipsisMiddle } from '../widget/EllipsisMiddle';

interface PartyProps {
  account: string;
  chain: Network;
  mode: NetworkMode;
  showName?: boolean;
  className?: string;
  copyable?: boolean;
}

export function Party({ chain, account, mode, copyable = false, showName = true, className = '' }: PartyProps) {
  const address = revertAccount(account, chain, mode);

  return (
    <div className={`flex flex-col max-w-xs ${className}`}>
      {showName && <span className="capitalize">{chain}</span>}
      <EllipsisMiddle copyable={copyable}>{address}</EllipsisMiddle>
    </div>
  );
}
