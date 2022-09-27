import { Tooltip } from 'antd';
import { PropsWithChildren } from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { CrossToken, EthereumChainConfig } from 'shared/model';
import { isMetamaskChainConsistent, isNativeMetamaskChain } from 'shared/utils/connection';
import { prettyNumber } from 'shared/utils/helper/balance';
import { isEthereumNetwork } from 'shared/utils/network/network';
import { getDisplayName } from 'utils/network';
import { useITranslation } from '../../hooks';
import { addToMetamask } from '../../utils';

type TokenOnChainProps = {
  token: CrossToken;
  isFrom?: boolean;
  asHistory?: boolean;
  className?: string;
};

// eslint-disable-next-line complexity
export const TokenOnChain = ({
  token,
  isFrom,
  children,
  asHistory,
  className = '',
}: PropsWithChildren<TokenOnChainProps>) => {
  const { t } = useITranslation();
  const chainLogoProps = asHistory ? { width: 40, height: 40 } : { width: 60, height: 60 };
  const addBtnDisplay =
    isEthereumNetwork(token.meta) &&
    !isNativeMetamaskChain(token.meta as EthereumChainConfig) &&
    token.type !== 'native';

  return (
    <div className={`flex items-center text-white ${className}`}>
      <div
        className={`hidden lg:block relative ${asHistory ? 'w-10 h-10' : 'w-14 h-14'}  ${
          isFrom ? 'order-1' : 'order-2 ml-3'
        }`}
      >
        <Logo name={token.logo} {...chainLogoProps} />
        <span
          className={`${asHistory ? 'w-4 h-4 -right-2' : 'w-7 h-7 -right-3'} absolute top-auto bottom-1 left-auto `}
        >
          <Logo name={token.meta?.logos[0].name} alt="..." width={20} height={20} />
        </span>
      </div>

      <div className={`flex flex-col space-y-1 truncate ${isFrom ? 'order-2 lg:ml-6' : 'order-1 items-end'}`}>
        <strong
          className={`font-medium text-sm ${isFrom ? 'text-left' : 'text-right'} ${
            asHistory ? (isFrom ? 'text-helix-red' : 'text-helix-green') : ''
          }`}
        >
          <Tooltip title={token.amount ?? null}>
            {token.amount &&
              `${asHistory ? (isFrom ? '- ' : '+ ') : ''}${prettyNumber(token.amount, {
                ignoreZeroDecimal: true,
                decimal: 5,
              })} ${token.symbol}`}
          </Tooltip>
        </strong>

        <small className="font-light text-xs opacity-70 inline-flex items-center gap-1">
          <span className="truncate">on {getDisplayName(token.meta)}</span>
          <span>{children}</span>
          {!isFrom && addBtnDisplay && asHistory && (
            <Tooltip title={t('Add to metamask')}>
              <Logo
                name="metamask.svg"
                width={14}
                height={14}
                className="cursor-pointer"
                onClick={() => {
                  isMetamaskChainConsistent(token.meta).subscribe(() => {
                    addToMetamask(token);
                  });
                }}
              />
            </Tooltip>
          )}
        </small>
      </div>
    </div>
  );
};
