import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { IAccountMeta, SupportedWallet } from 'shared/model';
import { isSameAddress, readStorage } from 'shared/utils/helper';
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
    const accStorage = readStorage()[departureConnection.type as SupportedWallet];
    const acc =
      departureConnection.accounts.find((value) => isSameAddress(value.address, accStorage ?? ''))?.address ||
      departureConnection.accounts[0]?.address;

    setAccount(acc ?? '');
  }, [departureConnection.accounts, departureConnection.type]);

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
