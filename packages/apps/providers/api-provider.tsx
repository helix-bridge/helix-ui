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
import { connect, getDirectionFromSettings, getInitialSetting, isEthereumNetwork } from 'shared/utils';
import { updateStorage } from 'shared/utils/helper/storage';
import Web3 from 'web3';

interface StoreState {
  mainConnection: Connection;
  assistantConnection: Connection;
  connections: (NoNullFields<PolkadotConnection> | EthereumConnection | TronConnection)[];
  network: ChainConfig;
  isDev: boolean;
  enableTestNetworks: boolean;
}

type SetNetworkAction = Action<'setNetwork', ChainConfig>;
type SetMainConnection = Action<'setMainConnection', Connection>;
type SetAssistantConnection = Action<'setAssistantConnection', Connection>;
type SetEnableTestNetworks = Action<'setEnableTestNetworks', boolean>;
type AddConnection = Action<'addConnection', Connection>;
type RemoveConnection = Action<'removeConnection', Connection>;

type Actions =
  | SetNetworkAction
  | SetMainConnection
  | SetAssistantConnection
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
  mainConnection: initialConnection,
  assistantConnection: initialConnection,
  connections: [],
  network: initialDirection.from.meta,
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
    case 'setNetwork': {
      return { ...state, network: action.payload };
    }

    case 'setMainConnection': {
      return { ...state, mainConnection: action.payload };
    }

    case 'setAssistantConnection': {
      return { ...state, assistantConnection: action.payload };
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
  connectNetwork: (network: ChainConfig) => void;
  connectAssistantNetwork: (network: ChainConfig) => void;
  disconnect: () => void;
  setNetwork: (network: ChainConfig) => void;
  setEnableTestNetworks: (enable: boolean) => void;
  setApi: (api: ApiPromise) => void;
};

export const ApiContext = createContext<ApiCtx | null>(null);

let subscription: Subscription = EMPTY.subscribe();

export const ApiProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const setNetwork = useCallback((payload: ChainConfig) => dispatch({ type: 'setNetwork', payload }), []);
  const setMainConnection = useCallback((payload: Connection) => dispatch({ type: 'setMainConnection', payload }), []);

  const setAssistantConnection = useCallback(
    (payload: Connection) => dispatch({ type: 'setAssistantConnection', payload }),
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

  const connectNetwork = useCallback(
    (chainConfig: ChainConfig) => {
      const target = state.connections.find(isConnectionOfChain(chainConfig));

      subscription.unsubscribe();

      setNetwork(chainConfig);

      subscription = iif(() => isConnectionAvailable(target), of(target!), connect(chainConfig)).subscribe(observer);
    },
    [isConnectionAvailable, observer, setNetwork, state.connections]
  );

  const connectAssistantNetwork = useCallback(
    (chainConfig: ChainConfig) => {
      const target = state.connections.find(isConnectionOfChain(chainConfig));

      const sub$$ = iif(() => isConnectionAvailable(target), of(target!), connect(chainConfig)).subscribe({
        next: (cur: Connection) => {
          if (cur.status === ConnectionStatus.success) {
            addConnection(cur);
            setAssistantConnection(cur);
          }
        },
        error: (err: unknown) => {
          console.log('🚨 ~ file: api-provider.tsx ~ line 242 ~ ApiProvider ~ err', err);
        },
      });

      subscription.add(sub$$);
    },
    [addConnection, isConnectionAvailable, setAssistantConnection, state.connections]
  );

  const disconnect = useCallback(() => {
    if (api && api.isConnected) {
      subscription.unsubscribe();

      setApi(null);
    }

    setMainConnection(initialConnection);
    setAssistantConnection(initialConnection);
  }, [api, setAssistantConnection, setMainConnection]);

  return (
    <ApiContext.Provider
      value={{
        ...state,
        connectNetwork,
        connectAssistantNetwork,
        disconnect,
        setNetwork,
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
