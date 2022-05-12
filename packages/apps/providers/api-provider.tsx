import { ApiPromise } from '@polkadot/api';
import { negate } from 'lodash';
import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import { EMPTY, iif, of, Subscription } from 'rxjs';
import {
  Action,
  ChainConfig,
  Connection,
  ConnectionStatus,
  EthereumChainConfig,
  EthereumConnection,
  NoNullFields,
  PolkadotConnection,
  TronConnection,
} from 'shared/model';
import { connect } from 'shared/utils/connection';
import { getDirectionFromSettings, getInitialSetting } from 'shared/utils/helper';
import { updateStorage } from 'shared/utils/helper/storage';
import { isEthereumNetwork } from 'shared/utils/network';
import Web3 from 'web3';

interface StoreState {
  departureConnection: Connection;
  arrivalConnection: Connection;
  connections: (NoNullFields<PolkadotConnection> | EthereumConnection | TronConnection)[];
  departure: ChainConfig;
  isDev: boolean;
  enableTestNetworks: boolean;
}

type SetDeparture = Action<'setDeparture', ChainConfig>;
type SetDepartureConnection = Action<'setDepartureConnection', Connection>;
type SetArrivalConnection = Action<'setArrivalConnection', Connection>;
type SetEnableTestNetworks = Action<'setEnableTestNetworks', boolean>;
type AddConnection = Action<'addConnection', Connection>;
type RemoveConnection = Action<'removeConnection', Connection>;

type Actions =
  | SetDeparture
  | SetDepartureConnection
  | SetArrivalConnection
  | SetEnableTestNetworks
  | AddConnection
  | RemoveConnection;

const isDev = process.env.REACT_APP_HOST_TYPE === 'dev';

const initialDirection = getDirectionFromSettings();

const initialConnection: Connection = {
  status: ConnectionStatus.pending,
  type: 'unknown',
  accounts: [],
  chainId: '',
  network: null,
};

const initialState: StoreState = {
  departureConnection: initialConnection,
  arrivalConnection: initialConnection,
  connections: [],
  departure: initialDirection.from.meta,
  isDev,
  enableTestNetworks: !!getInitialSetting('enableTestNetworks', isDev),
};

const isConnectionOfChain = (chain: ChainConfig) => {
  const isConnectToMetamask = chain.mode === 'dvm' || isEthereumNetwork(chain);

  return (target: Connection | NoNullFields<PolkadotConnection> | EthereumConnection) => {
    const { network, chainId } = target;

    return isConnectToMetamask
      ? chainId === Web3.utils.toHex((chain as EthereumChainConfig).ethereumChain.chainId)
      : network === chain.name;
  };
};

const isSameConnection = (origin: Connection) => {
  return (item: Connection) => {
    return (
      item.type === origin.type &&
      ((item.network === (origin as PolkadotConnection).network && !!item.network) ||
        (item.chainId === (origin as EthereumConnection).chainId && !!item.chainId))
    );
  };
};

// eslint-disable-next-line complexity
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

    case 'setEnableTestNetworks': {
      return { ...state, enableTestNetworks: action.payload };
    }

    case 'addConnection': {
      const omitMetamask = (connection: Connection) =>
        action.payload.type === 'metamask' ? connection.type !== 'metamask' : true;

      return {
        ...state,
        connections: state.connections
          .filter((item) => negate(isSameConnection(action.payload))(item) && omitMetamask(item))
          .concat([action.payload]),
      };
    }

    case 'removeConnection': {
      return {
        ...state,
        connections: state.connections.filter(negate(isSameConnection(action.payload))),
      };
    }

    default:
      return state;
  }
}

export type ApiCtx = StoreState & {
  api: ApiPromise | null;
  connectDepartureNetwork: (network: ChainConfig) => void;
  connectArrivalNetwork: (network: ChainConfig) => void;
  disconnect: () => void;
  setDeparture: (network: ChainConfig) => void;
  setEnableTestNetworks: (enable: boolean) => void;
  setApi: (api: ApiPromise) => void;
};

export const ApiContext = createContext<ApiCtx | null>(null);

let subscription: Subscription = EMPTY.subscribe();

export const ApiProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const setDeparture = useCallback((payload: ChainConfig) => dispatch({ type: 'setDeparture', payload }), []);
  const setMainConnection = useCallback(
    (payload: Connection) => dispatch({ type: 'setDepartureConnection', payload }),
    []
  );

  const setArrivalConnection = useCallback(
    (payload: Connection) => dispatch({ type: 'setArrivalConnection', payload }),
    []
  );

  const removeConnection = useCallback((payload: Connection) => dispatch({ type: 'removeConnection', payload }), []);
  const addConnection = useCallback((payload: Connection) => dispatch({ type: 'addConnection', payload }), []);

  const setEnableTestNetworks = useCallback((payload: boolean) => {
    dispatch({ type: 'setEnableTestNetworks', payload });
    updateStorage({ enableTestNetworks: payload });
  }, []);

  const [api, setApi] = useState<ApiPromise | null>(null);

  const observer = useMemo(
    () => ({
      next: (connection: Connection) => {
        setMainConnection(connection);

        const nApi = (connection as PolkadotConnection).api;

        if (nApi && connection.status === ConnectionStatus.success) {
          setApi(nApi);
          addConnection(connection);
        } else if (connection.status === ConnectionStatus.success) {
          addConnection(connection);
        }
      },
      error: (err: unknown) => {
        setMainConnection({ ...initialConnection, status: ConnectionStatus.error });
        console.error('%c connection error ', 'font-size:13px; background:pink; color:#bf2c9f;', err);
      },
      complete: () => {
        console.info('Connection life is over');
      },
    }),
    [addConnection, setMainConnection]
  );

  const isConnectionAvailable = useCallback(
    (connection: Connection | undefined) => {
      const availableStatus = [ConnectionStatus.success, ConnectionStatus.connecting, ConnectionStatus];
      const existAvailableConnection = !!connection && availableStatus.includes(connection.status);

      if (connection && !existAvailableConnection) {
        removeConnection(connection);
      }

      return existAvailableConnection;
    },
    [removeConnection]
  );

  const connectDepartureNetwork = useCallback(
    (chainConfig: ChainConfig) => {
      const target = state.connections.find(isConnectionOfChain(chainConfig));

      subscription.unsubscribe();

      setDeparture(chainConfig);

      subscription = iif(() => isConnectionAvailable(target), of(target!), connect(chainConfig)).subscribe(observer);
    },
    [isConnectionAvailable, observer, setDeparture, state.connections]
  );

  const connectArrivalNetwork = useCallback(
    (chainConfig: ChainConfig) => {
      const target = state.connections.find(isConnectionOfChain(chainConfig));

      const sub$$ = iif(() => isConnectionAvailable(target), of(target!), connect(chainConfig)).subscribe({
        next: (cur: Connection) => {
          if (cur.status === ConnectionStatus.success) {
            addConnection(cur);
            setArrivalConnection(cur);
          }
        },
        error: (err: unknown) => {
          console.log('🚨 ~ file: api-provider.tsx ~ line 242 ~ ApiProvider ~ err', err);
        },
      });

      subscription.add(sub$$);
    },
    [addConnection, isConnectionAvailable, setArrivalConnection, state.connections]
  );

  const disconnect = useCallback(() => {
    if (api && api.isConnected) {
      subscription.unsubscribe();

      setApi(null);
    }

    setMainConnection(initialConnection);
    setArrivalConnection(initialConnection);
  }, [api, setArrivalConnection, setMainConnection]);

  return (
    <ApiContext.Provider
      value={{
        ...state,
        connectDepartureNetwork,
        connectArrivalNetwork,
        disconnect,
        setDeparture,
        setEnableTestNetworks,
        setApi,
        api,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext) as Exclude<ApiCtx, null>;
