import React, { createContext, useContext, useEffect, useState } from 'react';
import { EthereumChainConfig, SupportedWallet } from 'shared/model';
import { readStorage } from 'shared/utils/helper/storage';
import { getChainConfig } from '../utils/network';
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
  const { departureConnection, departure, connectAndUpdateDepartureNetwork } = useApi();
  const [walletMatched, setWalletMatched] = useState(true);
  const [chainMatched, setChainMatched] = useState(true);

  useEffect(() => {
    const { wallet } = departureConnection;
    const walletMatch =
      wallet === 'unknown' || departure.wallets.includes(departureConnection.wallet as SupportedWallet);
    let chainMatch = walletMatch;

    if (walletMatch && wallet === 'metamask') {
      chainMatch =
        (departure as EthereumChainConfig).ethereumChain &&
        (departure as EthereumChainConfig).ethereumChain.chainId === departureConnection.chainId;
    }

    setWalletMatched(walletMatch);
    setChainMatched(chainMatch);
  }, [departure, departureConnection, departureConnection.chainId, departureConnection.wallet]);

  useEffect(() => {
    const { activeWallet, from } = readStorage();
    if (activeWallet?.chain && activeWallet.chain === from?.host) {
      const config = getChainConfig(activeWallet.chain);

      if (activeWallet.wallet && config.wallets.includes(activeWallet.wallet)) {
        connectAndUpdateDepartureNetwork(config, activeWallet.wallet);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
