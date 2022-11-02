import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { IAccountMeta } from 'shared/model';
import { readStorage, updateStorage } from 'shared/utils/helper/storage';
import { isSameAddress, isSS58Address } from 'shared/utils/helper/validator';
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
    const { activeMetamaskAccount, activePolkadotAccount } = readStorage();
    const acc =
      departureConnection.accounts.find((value) =>
        isSameAddress(
          value.address,
          (departureConnection.type === 'polkadot' ? activePolkadotAccount : activeMetamaskAccount) ?? ''
        )
      )?.address || departureConnection.accounts[0]?.address;

    if (acc) {
      setAccount(acc);
    }
  }, [departureConnection.accounts, departureConnection.type]);

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
