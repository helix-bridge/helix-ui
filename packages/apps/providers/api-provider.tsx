import { negate } from 'lodash';
import { createContext, useCallback, useContext, useReducer, useState } from 'react';
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
} from 'shared/model';
import { connect } from 'shared/utils/connection';
import { getDirectionFromSettings, getInitialSetting } from 'shared/utils/helper';
import { updateStorage } from 'shared/utils/helper/storage';
import { isEthereumNetwork } from 'shared/utils/network';

interface StoreState {
  departureConnection: Connection;
  arrivalConnection: Connection;
  connections: (NoNullFields<PolkadotConnection> | EthereumConnection)[];
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
  chainId: 'unknown',
};

const initialState: StoreState = {
  departureConnection: initialConnection,
  arrivalConnection: initialConnection,
  connections: [],
  departure: initialDirection.from.meta,
  isDev,
  enableTestNetworks: !!getInitialSetting('enableTestNetworks', isDev),
};

const isSameConnection = (origin: Connection) => {
  return (item: Connection) => item.type === origin.type && item.chainId === origin.chainId;
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
  connectDepartureNetwork: (network: ChainConfig) => void;
  connectArrivalNetwork: (network: ChainConfig) => void;
  disconnect: () => void;
  isConnecting: boolean;
  setDeparture: (network: ChainConfig) => void;
  setEnableTestNetworks: (enable: boolean) => void;
};

export const ApiContext = createContext<ApiCtx | null>(null);

let dep$$: Subscription = EMPTY.subscribe();
let arr$$: Subscription = EMPTY.subscribe();

export const ApiProvider = ({ children }: React.PropsWithChildren<unknown>) => {
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

  const removeConnection = useCallback((payload: Connection) => dispatch({ type: 'removeConnection', payload }), []);
  const addConnection = useCallback((payload: Connection) => dispatch({ type: 'addConnection', payload }), []);

  const setEnableTestNetworks = useCallback((payload: boolean) => {
    dispatch({ type: 'setEnableTestNetworks', payload });
    updateStorage({ enableTestNetworks: payload });
  }, []);

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

  const getConnection = useCallback(
    (chainConfig: ChainConfig, action: (payload: Connection) => void) => {
      const isConnectToMetamask = chainConfig.mode === 'dvm' || isEthereumNetwork(chainConfig);

      const target = state.connections.find((item) => {
        return isConnectToMetamask
          ? (item as EthereumConnection).chainId === (chainConfig as EthereumChainConfig).ethereumChain.chainId
          : (item as PolkadotConnection).chainId === chainConfig.name;
      });

      setIsConnecting(true);

      return iif(() => isConnectionAvailable(target), of(target!), connect(chainConfig)).subscribe({
        next: (connection: Connection) => {
          if (connection.status === ConnectionStatus.success) {
            addConnection(connection);
            action(connection);
            setIsConnecting(false);
          }
        },
        error: (err: unknown) => {
          console.log('🚨 ~ file: api-provider.tsx ~ get connection ~ error', err);
          action({ ...initialConnection, status: ConnectionStatus.error });
          setIsConnecting(false);
        },
        complete: () => {
          console.log('🥀 Departure connection life is over');
          setIsConnecting(false);
        },
      });
    },
    [addConnection, isConnectionAvailable, state.connections]
  );

  const connectDepartureNetwork = useCallback(
    (chainConfig: ChainConfig) => {
      dep$$.unsubscribe();
      dep$$ = getConnection(chainConfig, setDepartureConnection);
      setDeparture(chainConfig);
    },
    [getConnection, setDeparture, setDepartureConnection]
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
        connectDepartureNetwork,
        connectArrivalNetwork,
        disconnect,
        setDeparture,
        setEnableTestNetworks,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext) as Exclude<ApiCtx, null>;
