import dynamic from 'next/dynamic';
import { IAccountMeta } from '../../model';
import { EllipsisMiddle } from './EllipsisMiddle';

interface IdentAccountProps {
  account: IAccountMeta;
  className?: string;
  iconSize?: number;
}

const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
  ssr: false,
});

// eslint-disable-next-line no-magic-numbers
export function IdentAccountAddress({ account: { address, meta }, className = '', iconSize = 32 }: IdentAccountProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <Identicon size={iconSize} value={address} className="rounded-full border border-gray-100" />
      {!!meta?.name && <span className="ml-2">{meta?.name}</span>}
      <span className="mx-1">-</span>
      <EllipsisMiddle className="w-2/3">{address}</EllipsisMiddle>
    </div>
  );
}
