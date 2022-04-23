import { useMemo } from 'react';
import { MappingToken, RequiredPartial } from '../../model';
import { JazzIcon } from './Jazzicon';
import { EllipsisMiddle } from './EllipsisMiddle';

interface Erc20SimpleProps {
  token: RequiredPartial<MappingToken, 'address' | 'logo' | 'name' | 'symbol'>;
  className?: string;
}

export function MappingTokenInfo({ token, className }: Erc20SimpleProps) {
  const { logo, source, address, name, symbol } = token;
  const displayName = useMemo(() => (name?.includes('[') ? name.replace(/\[.*/g, '') : name), [name]);

  return (
    <div className={`flex w-2/3 ${className ?? ''}`}>
      {logo ? <img src={`/images/${logo}`} alt="" /> : <JazzIcon address={source || address}></JazzIcon>}
      <div className="ml-4 w-full">
        <p>
          <span>{symbol}</span>
          <sup className="ml-2 text-xs">{displayName}</sup>
        </p>
        <EllipsisMiddle>{address}</EllipsisMiddle>
      </div>
    </div>
  );
}
