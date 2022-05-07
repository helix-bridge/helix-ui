import { Typography } from 'antd';
import dynamic from 'next/dynamic';
import React, { CSSProperties, useMemo, useRef } from 'react';
import { EllipsisMiddle } from 'shared/components/widget/EllipsisMiddle';
import { Logo } from 'shared/components/widget/Logo';
import { ChainConfig } from 'shared/model';
import { useAccount, useApi } from '../../../providers';

const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
  ssr: false,
});

function ActiveAccount({
  children,
  containerStyle,
  chain,
  isLargeRounded = true,
  className = '',
  onClick = () => {
    // do nothing
  },
}: React.PropsWithChildren<{
  isLargeRounded?: boolean;
  logoStyle?: CSSProperties;
  containerStyle?: CSSProperties;
  className?: string;
  textClassName?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  chain: ChainConfig;
}>) {
  const ref = useRef<HTMLSpanElement>(null);
  const { network } = useApi();
  const containerCls = useMemo(
    () =>
      `flex items-center justify-between leading-normal whitespace-nowrap p-1 overflow-hidden bg-${network.name} 
        ${isLargeRounded ? 'rounded-xl ' : 'rounded-lg '}
        ${className}`,
    [isLargeRounded, className, network]
  );

  return (
    <div className={containerCls} onClick={onClick} style={containerStyle || {}}>
      <Logo chain={chain} width={32} height={32} />
      <Typography.Text className="mr-2" style={{ color: 'inherit', maxWidth: '64px' }} ellipsis={true}>
        {ref.current?.textContent}
      </Typography.Text>
      {children}
    </div>
  );
}

export function Connection() {
  const { account } = useAccount();
  const { network } = useApi();

  return (
    <section className={`flex items-center gap-2 connection`}>
      {account && (
        <>
          <ActiveAccount
            className="max-w-xs text-white hidden lg:flex cursor-pointer"
            logoStyle={{ width: 24 }}
            isLargeRounded={false}
            chain={network}
          >
            <EllipsisMiddle className="text-white overflow-hidden mr-2" copyable>
              {account}
            </EllipsisMiddle>
          </ActiveAccount>

          <span className="lg:hidden flex">
            <Identicon value={account} size={20} className="rounded-full border p-1" />
          </span>
        </>
      )}
    </section>
  );
}
