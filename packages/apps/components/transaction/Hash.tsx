import { ExplorerLink } from 'shared/components/widget/ExplorerLink';
import { Network } from 'shared/model';

interface HashProps {
  hash: string;
  network: Network;
}

export const Hash = ({ hash, network }: HashProps) => {
  const txHash = hash.includes('-') ? undefined : hash;
  const extrinsic = hash.includes('-') ? hash.split('-') : undefined;

  return (
    <ExplorerLink
      network={network}
      txHash={txHash}
      copyable
      extrinsic={extrinsic && { height: extrinsic[0], index: extrinsic[1] }}
      className="hover:opacity-80 transition-opacity duration-200 underline text-white"
    ></ExplorerLink>
  );
};
