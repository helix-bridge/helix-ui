import { message } from 'antd';
import { useCallback, useMemo, useReducer, useState } from 'react';
import { map } from 'rxjs';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { RegisterStatus } from '../config/constant';
import { Action, Erc20RegisterStatus, MappingToken, NullableCrossChainDirection, RequiredPartial } from '../model';
import { isDVM, isEthereumNetwork, getErc20TokenBalance } from '../utils';
import { getKnownMappingTokens, StoredProof } from '../utils/mappingToken/mappingToken';
import { useApi } from './api';

export type MemoedTokenInfo = RequiredPartial<MappingToken, 'name' | 'logo' | 'decimals' | 'address' | 'symbol'>;

export type ActionType = 'updateTokens' | 'updateProof' | 'switchToConfirmed' | 'updateTotal';

interface State {
  tokens: MemoedTokenInfo[];
  proofs: StoredProof[];
  total: number;
}

const initialState: State = {
  tokens: [],
  proofs: [],
  total: 0,
};

// eslint-disable-next-line complexity
function reducer(state = initialState, action: Action<ActionType, MemoedTokenInfo[] | StoredProof | string | number>) {
  switch (action.type) {
    case 'updateTokens':
      return { ...state, tokens: action.payload as MemoedTokenInfo[] };
    case 'updateProof':
      return { ...state, proofs: [...state.proofs, action.payload as StoredProof] };
    case 'switchToConfirmed': {
      const address = action.payload as string;
      const index = state.tokens.findIndex((item) => item.address === address);
      const data = [...state.tokens];

      if (index > -1) {
        data[index].status = RegisterStatus.registered;
      }
      return { ...state, tokens: data };
    }
    case 'updateTotal':
      return { ...state, total: +action.payload as number };
    default:
      return state;
  }
}

/**
 *
 * @params {string} networkType
 * @params {number} status - token register status 1:registered 2:registering
 */
export const useMappingTokens = (
  { from, to }: NullableCrossChainDirection,
  status: Erc20RegisterStatus = RegisterStatus.unregister
) => {
  const [loading, setLoading] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const addKnownProof = useCallback((proofs: StoredProof) => dispatch({ payload: proofs, type: 'updateProof' }), []);
  const switchToConfirmed = useCallback((token: string) => dispatch({ payload: token, type: 'switchToConfirmed' }), []);
  const { mainConnection: connection } = useApi();
  const { address: currentAccount } = useMemo(() => (connection.accounts || [])[0] ?? '', [connection.accounts]);
  const refreshTokenBalance = useCallback(
    async (tokenAddress: string) => {
      const balance = await getErc20TokenBalance(tokenAddress, currentAccount, true);
      const tokens = [...state.tokens];
      const index = tokens.findIndex((item) => item.address === tokenAddress);

      if (index > 0) {
        tokens[index].balance = balance;
        dispatch({ payload: tokens, type: 'updateTokens' });
      }
    },
    [currentAccount, state.tokens]
  );

  useDeepCompareEffect(() => {
    if (!from || !to || !(isEthereumNetwork(from.name) || isDVM(from))) {
      dispatch({ payload: [], type: 'updateTokens' });
      message.error(
        'The departure and arrival networks must exist and the departure network must be an Ethereum network or a DVM network'
      );
      return;
    }

    setLoading(true);

    const subscription = getKnownMappingTokens(currentAccount, { from, to })
      .pipe(
        map(({ tokens, total }) => ({
          total,
          tokens: status > 0 ? tokens.filter((item) => item.status && +item.status === status) : tokens,
        }))
      )
      .subscribe({
        next: ({ tokens, total }) => {
          dispatch({ payload: tokens, type: 'updateTokens' });
          dispatch({ payload: total, type: 'updateTotal' });
        },
        error: (error) => {
          message.error('Querying failed, please try it again later');
          console.warn(
            '%c [ query mapping token error ]',
            'font-size:13px; background:pink; color:#bf2c9f;',
            error.message
          );
          setLoading(false);
        },
        complete: () => setLoading(false),
      });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [currentAccount, from, status, to]);

  return {
    ...state,
    loading,
    dispatch,
    addKnownProof,
    switchToConfirmed,
    refreshTokenBalance,
  };
};
