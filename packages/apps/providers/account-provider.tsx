import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useContext } from 'react';
import { IAccountMeta } from 'shared/model';
import { isSameAddress, readStorage, updateStorage } from 'shared/utils/helper';
import { useApi } from './api-provider';

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
    const accStorage = readStorage().activeAccount;
    const acc =
      departureConnection.accounts.find((value) => value.address === accStorage)?.address ||
      departureConnection.accounts[0]?.address;

    if (acc) {
      setAccount(acc);
    }
  }, [departureConnection.accounts]);

  useEffect(() => {
    updateStorage({ activeAccount: account });
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
