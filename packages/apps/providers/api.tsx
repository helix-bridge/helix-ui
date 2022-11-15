import { createContext, useCallback, useContext, useReducer, useState } from 'react';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { iif } from 'rxjs/internal/observable/iif';
import { of } from 'rxjs/internal/observable/of';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
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
    (chainConfig: ChainConfig, action: (payload: Connection) => void, specifiedWallet?: SupportedWallet) => {
      const { activeWallet } = readStorage();
      const storedWallet = activeWallet && activeWallet.wallet;
      const isStoredAvailable = chainConfig.wallets.includes(storedWallet as unknown as never);
      const cachedWallet = isStoredAvailable ? storedWallet : undefined;
      const availableWallet = specifiedWallet ?? cachedWallet;
      let selectedWallet = availableWallet ?? chainConfig.wallets[0];

      setIsConnecting(true);

      return iif(
        () =>
          !availableWallet ||
          (chainConfig.wallets.length > 1 &&
            ((!specifiedWallet && !isStoredAvailable) || action === setArrivalConnection)),
        applyModalObs({
          title: (
            <div className="inline-flex items-center space-x-1 mb-4">
              <span>{t('Select Wallet')}</span>
            </div>
          ),
          content: (
            <WalletList
              defaultValue={selectedWallet}
              onSelect={(value) => {
                selectedWallet = value;
              }}
              wallets={chainConfig.wallets}
            ></WalletList>
          ),
        }).pipe(map((goOn) => (goOn ? selectedWallet : null))),
        of(selectedWallet)
      )
        .pipe(switchMap((wallet) => (wallet ? connect(chainConfig, wallet) : EMPTY)))
        .subscribe({
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
            updateStorage({ activeWallet: { wallet: availableWallet, chain: chainConfig.name } });
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
