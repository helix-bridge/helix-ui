import { createContext, useCallback, useContext, useReducer, useState } from 'react';
import { switchMap } from 'rxjs';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { iif } from 'rxjs/internal/observable/iif';
import type { Subscription } from 'rxjs/internal/Subscription';
import { DEFAULT_DIRECTION } from 'shared/config/constant';
import { isDev } from 'shared/config/env';
import { Action, ChainConfig, Connection, ConnectionStatus, PolkadotChainConfig, SupportedWallet } from 'shared/model';
import { connect } from 'shared/utils/connection';
import { convertToSS58 } from 'shared/utils/helper/address';
import { readStorage, updateStorage } from 'shared/utils/helper/storage';
import { applyModalObs } from 'shared/utils/tx';
import { WalletList } from '../components/widget/account/SelectWalletModal';
import { useITranslation } from '../hooks';

interface StoreState {
  departureConnection: Connection;
  arrivalConnection: Connection;
  departure: ChainConfig;
  isDev: boolean;
}

type SetDeparture = Action<'setDeparture', ChainConfig>;
type SetDepartureConnection = Action<'setDepartureConnection', Connection>;
type SetArrivalConnection = Action<'setArrivalConnection', Connection>;
type AddConnection = Action<'addConnection', Connection>;
type RemoveConnection = Action<'removeConnection', Connection>;

type Actions = SetDeparture | SetDepartureConnection | SetArrivalConnection | AddConnection | RemoveConnection;

const initialConnection: Connection = {
  status: ConnectionStatus.pending,
  wallet: 'unknown',
  accounts: [],
  chainId: 'unknown',
};

const initialState: StoreState = {
  departureConnection: initialConnection,
  arrivalConnection: initialConnection,
  departure: DEFAULT_DIRECTION.from.meta,
  isDev,
};

function reducer(state: StoreState, action: Actions): StoreState {
  switch (action.type) {
    case 'setDeparture': {
      return { ...state, departure: action.payload };
    }

    case 'setDepartureConnection': {
      return { ...state, departureConnection: action.payload };
    }

    case 'setArrivalConnection': {
      return { ...state, arrivalConnection: action.payload };
    }

    default:
      return state;
  }
}

export type ApiCtx = StoreState & {
  connectAndUpdateDepartureNetwork: (network: ChainConfig, wallet?: SupportedWallet) => void;
  connectDepartureNetwork: (network: ChainConfig, wallet?: SupportedWallet) => void;
  connectArrivalNetwork: (network: ChainConfig, wallet?: SupportedWallet) => void;
  disconnect: () => void;
  isConnecting: boolean;
  setDeparture: (network: ChainConfig) => void;
};

export const ApiContext = createContext<ApiCtx | null>(null);

let dep$$: Subscription = EMPTY.subscribe();
let arr$$: Subscription = EMPTY.subscribe();

export const ApiProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { t } = useITranslation();
  const [state, dispatch] = useReducer(reducer, initialState);
  const setDeparture = useCallback((payload: ChainConfig) => dispatch({ type: 'setDeparture', payload }), []);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const setDepartureConnection = useCallback(
    (payload: Connection) => dispatch({ type: 'setDepartureConnection', payload }),
    []
  );

  const setArrivalConnection = useCallback(
    (payload: Connection) => dispatch({ type: 'setArrivalConnection', payload }),
    []
  );

  const getConnection = useCallback(
    (chainConfig: ChainConfig, action: (payload: Connection) => void, wallet?: SupportedWallet) => {
      const { activeWallet } = readStorage();
      const cachedWallet = activeWallet && activeWallet.wallet;
      const isCachedAvailable = chainConfig.wallets.includes(cachedWallet as unknown as never);
      let selectedWallet = wallet ?? (isCachedAvailable ? cachedWallet : undefined);

      setIsConnecting(true);

      return iif(
        // eslint-disable-next-line complexity
        () =>
          !selectedWallet ||
          (chainConfig.wallets.length > 1 &&
            ((!wallet && (!activeWallet || !isCachedAvailable)) || action === setArrivalConnection)),
        applyModalObs({
          title: (
            <div className="inline-flex items-center space-x-1 mb-4">
              <span>{t('Select Wallet')}</span>
            </div>
          ),
          content: (
            <WalletList
              defaultValue={selectedWallet || chainConfig.wallets[0]}
              onSelect={(value) => {
                selectedWallet = value;
              }}
              wallets={chainConfig.wallets}
            ></WalletList>
          ),
        }).pipe(switchMap((goOn) => (goOn ? connect(chainConfig, selectedWallet ?? chainConfig.wallets[0]) : EMPTY))),
        connect(chainConfig, selectedWallet!)
      ).subscribe({
        next: (connection: Connection) => {
          if (connection.status === ConnectionStatus.success) {
            if (connection.wallet === 'polkadot') {
              connection = {
                ...connection,
                accounts: connection.accounts.map((item) => ({
                  ...item,
                  address: convertToSS58(item.address, (state.departure as PolkadotChainConfig).ss58Prefix),
                })),
              };
            }
            action(connection);
            setIsConnecting(false);
          }
          updateStorage({ activeWallet: { wallet: selectedWallet, chain: chainConfig.name } });
        },
        error: (_: unknown) => {
          action({ ...initialConnection, status: ConnectionStatus.error });
          setIsConnecting(false);
        },
        complete: () => {
          setIsConnecting(false);
        },
      });
    },
    [setArrivalConnection, state.departure, t]
  );

  const connectDepartureNetwork = useCallback(
    (chainConfig: ChainConfig, wallet?: SupportedWallet) => {
      dep$$.unsubscribe();
      dep$$ = getConnection(chainConfig, setDepartureConnection, wallet);
    },
    [getConnection, setDepartureConnection]
  );

  const connectAndUpdateDepartureNetwork = useCallback(
    (chainConfig: ChainConfig, wallet?: SupportedWallet) => {
      connectDepartureNetwork(chainConfig, wallet);
      setDeparture(chainConfig);
    },
    [connectDepartureNetwork, setDeparture]
  );

  const connectArrivalNetwork = useCallback(
    (chainConfig: ChainConfig) => {
      arr$$.unsubscribe();
      arr$$ = getConnection(chainConfig, setArrivalConnection);
    },
    [getConnection, setArrivalConnection]
  );

  const disconnect = useCallback(() => {
    setDepartureConnection(initialConnection);
    setArrivalConnection(initialConnection);
    setIsConnecting(false);
    dep$$.unsubscribe();
    arr$$.unsubscribe();
  }, [setArrivalConnection, setDepartureConnection]);

  return (
    <ApiContext.Provider
      value={{
        ...state,
        isConnecting,
        connectAndUpdateDepartureNetwork,
        connectDepartureNetwork,
        connectArrivalNetwork,
        disconnect,
        setDeparture,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext) as Exclude<ApiCtx, null>;
