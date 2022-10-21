import React, { createContext, useContext, useEffect, useState } from 'react';
import { EthereumChainConfig, SupportedWallet } from 'shared/model';
import { useApi } from './api';

export interface WalletCtx {
  matched: boolean;
  walletMatched: boolean;
  chainMatched: boolean;
  setChainMatched: (matched: boolean) => void;
}

export const WalletContext = createContext<WalletCtx | null>(null);

export const useWallet = () => useContext(WalletContext) as Exclude<WalletCtx, null>;

export const WalletProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { departureConnection, departure } = useApi();
  const [walletMatched, setWalletMatched] = useState(true);
  const [chainMatched, setChainMatched] = useState(true);

  // eslint-disable-next-line complexity
  useEffect(() => {
    const { type } = departureConnection;
    const walletMatch = type === 'unknown' || departure.wallets.includes(departureConnection.type as SupportedWallet);
    let chainMatch = walletMatch;

    if (walletMatch && type === 'metamask') {
      chainMatch =
        (departure as EthereumChainConfig).ethereumChain &&
        (departure as EthereumChainConfig).ethereumChain.chainId === departureConnection.chainId;
    }

    setWalletMatched(walletMatch);
    setChainMatched(chainMatch);
  }, [departure, departureConnection, departureConnection.chainId, departureConnection.type]);

  return (
    <WalletContext.Provider
      value={{
        walletMatched,
        chainMatched,
        matched: walletMatched && chainMatched,
        setChainMatched,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
