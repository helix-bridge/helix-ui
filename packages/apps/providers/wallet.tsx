import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { EthereumChainConfig, SupportedWallet } from 'shared/model';
import { useApi } from './api';

export interface WalletCtx {
  matched: boolean;
  walletMatched: boolean;
  chainMatched: boolean;
}

export const WalletContext = createContext<WalletCtx | null>(null);

export const useWallet = () => useContext(WalletContext) as Exclude<WalletCtx, null>;

export const WalletProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { departureConnection, departure } = useApi();
  const [walletMatched, setWalletMatched] = useState(true);

  const chainMatched = useMemo(() => {
    if (departureConnection.type === 'metamask') {
      return (
        walletMatched &&
        (departure as EthereumChainConfig).ethereumChain &&
        (departure as EthereumChainConfig).ethereumChain.chainId === departureConnection.chainId
      );
    }
    return true;
  }, [departure, departureConnection.chainId, departureConnection.type, walletMatched]);

  const matched = useMemo(() => walletMatched && chainMatched, [chainMatched, walletMatched]);

  useEffect(() => {
    const { type } = departureConnection;

    if (type === 'unknown') {
      setWalletMatched(true);
      return;
    }

    setWalletMatched(departure.wallets.includes(departureConnection.type as SupportedWallet));
  }, [departure, departureConnection]);

  return (
    <WalletContext.Provider
      value={{
        walletMatched,
        chainMatched,
        matched,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
