import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { IAccountMeta, PolkadotChainConfig, PolkadotTypeNetwork } from 'shared/model';
import { polkadotExtensions } from 'shared/utils/connection';
import { convertToSS58 } from 'shared/utils/helper/address';
import { updateStorage } from 'shared/utils/helper/storage';
import { isSameAddress, isSS58Address } from 'shared/utils/helper/validator';
import { getChainConfig } from '../utils/network';
import { useApi } from './api';

export interface AccountCtx {
  account: string;
  setAccount: (account: string) => void;
  accountWithMeta: IAccountMeta;
}

export const AccountContext = createContext<AccountCtx | null>(null);

export const AccountProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [account, setAccount] = useState<string>('');
  const { departureConnection } = useApi();

  const accountWithMeta = useMemo(
    () =>
      departureConnection.accounts.find((item) => isSameAddress(item.address, account)) ??
      departureConnection.accounts[0],
    [account, departureConnection]
  );

  useEffect(() => {
    const isPolkadotTypeConnection = polkadotExtensions.includes(departureConnection.wallet as unknown as never);
    const acc = departureConnection.accounts.at(0)?.address;

    if (acc) {
      if (isPolkadotTypeConnection) {
        const config = getChainConfig(departureConnection.chainId as PolkadotTypeNetwork) as PolkadotChainConfig;

        setAccount(convertToSS58(acc, config.ss58Prefix));
      } else {
        setAccount(acc);
      }
    }
  }, [departureConnection.accounts, departureConnection.chainId, departureConnection.wallet]);

  useEffect(() => {
    if (account) {
      updateStorage({ [isSS58Address(account) ? 'activePolkadotAccount' : 'activeMetamaskAccount']: account });
    }
  }, [account]);

  return (
    <AccountContext.Provider
      value={{
        account,
        accountWithMeta,
        setAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => useContext(AccountContext) as Exclude<AccountCtx, null>;
