import { memoize } from 'lodash';
import { combineLatest, from, interval, Observable, of, take, timer, zip } from 'rxjs';
import {
  catchError,
  delayWhen,
  mergeMap,
  retry,
  retryWhen,
  scan,
  startWith,
  switchMap,
  switchMapTo,
  tap,
} from 'rxjs/operators';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { abi } from '../../config/abi';
import { RegisterStatus, SHORT_DURATION } from '../../config/constant';
import { ChainConfig, CrossChainDirection, DVMChainConfig, EthereumChainConfig, MappingToken } from '../../model';
import { DVMBridgeConfig, getAvailableDVMBridge, getBridge, isS2S, isSubstrateDVM2Substrate } from '../bridge';
import { MMRProof } from '../mmr';
import { chainConfigToVertices, connect, entrance } from '../network';
import { getErc20MappingAddress, getS2SMappingAddress } from './mappingParams';
import { getErc20Meta } from './mappingTokenMeta';

export interface Erc20RegisterProof {
  extrinsic_index: string;
  account_id: string;
  block_num: number;
  block_hash: string;
  backing: string;
  source: string;
  target: string;
  block_timestamp: number;
  mmr_index: number;
  mmr_root: string;
  signatures: string;
  block_header: string;
  tx: string;
}

export type StoredProof = {
  mmrProof: MMRProof;
  registerProof: Erc20RegisterProof;
  eventsProof: string;
};

/* --------------------------------------------Inner Section------------------------------------------------------- */

function createMappingTokenContract(departure: DVMChainConfig, arrival: ChainConfig, mappingAddress: string): Contract {
  const web3 = entrance.web3.getInstance(departure.provider.rpc);
  const s2s = isS2S(chainConfigToVertices(departure), chainConfigToVertices(arrival));

  return new web3.eth.Contract(s2s ? abi.S2SMappingTokenABI : abi.Erc20MappingTokenABI, mappingAddress);
}

const getMappingTokenLength = memoize(
  async (departure: DVMChainConfig, arrival: ChainConfig, mappingAddress: string) => {
    const mappingContract = createMappingTokenContract(departure, arrival, mappingAddress);
    const len: number = await mappingContract.methods.tokenLength().call();

    return len;
  },
  (departure: DVMChainConfig, arrival: ChainConfig, mappingAddress: string) =>
    departure.name + '-' + arrival.name + '-' + mappingAddress
);

/**
 * @function getFromDvm - get all tokens at dvm side
 * @params {string} currentAccount
 * @returns tokens that status maybe registered or registering
 */
function getMappingTokensFromDVM(
  currentAccount: string,
  departure: DVMChainConfig,
  arrival: EthereumChainConfig,
  mappingAddress: string
) {
  const s2s = isS2S(chainConfigToVertices(departure), chainConfigToVertices(arrival));
  const countObs = from(getMappingTokenLength(departure, arrival, mappingAddress));
  // FIXME: method predicate logic below should be removed after abi method is unified.
  const getToken = (index: number) =>
    of(null).pipe(
      switchMap(() => {
        const mappingContract = createMappingTokenContract(departure, arrival, mappingAddress);

        return from(mappingContract.methods[s2s ? 'allMappingTokens' : 'allTokens'](index).call() as Promise<string>);
      }),
      retryWhen((err) =>
        err.pipe(
          tap((error) => {
            console.warn('WEB3 PROVIDER ERROR:', error.message);
            entrance.web3.removeInstance(departure.provider.rpc);
          }),
          delayWhen(() => interval(SHORT_DURATION))
        )
      ),
      switchMap((address) => {
        const mappingContract = createMappingTokenContract(departure, arrival, mappingAddress);
        const tokenObs = from(getErc20Meta(address));

        const infoObs = from(
          mappingContract.methods[s2s ? 'mappingToken2OriginalInfo' : 'tokenToInfo'](address).call() as Promise<{
            source: string;
            backing: string;
          }>
        );

        const bridge = getBridge<DVMBridgeConfig>([departure, arrival]);

        const statusObs = s2s
          ? of(1)
          : infoObs.pipe(
              switchMap(({ source }) =>
                getTokenRegisterStatus(source, bridge.config.contracts.redeem, arrival.provider.etherscan)
              )
            );

        const balanceObs =
          currentAccount && Web3.utils.isAddress(currentAccount)
            ? from(getErc20TokenBalance(address, currentAccount, false))
            : of(Web3.utils.toBN(0));

        return zip(
          [tokenObs, infoObs, statusObs, balanceObs],
          (token, info, status, balance) =>
            ({
              ...info,
              ...token,
              balance,
              status,
              address,
            } as MappingToken)
        );
      })
    );

  return queryMappingTokens(countObs, getToken);
}

/**
 * @description get all tokens at ethereum side
 * @returns tokens that status maybe registered or registering
 */
function getMappingTokensFromEthereum(currentAccount: string, direction: CrossChainDirection) {
  const bridge = getBridge<DVMBridgeConfig>(direction);
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const backingContract = new web3.eth.Contract(abi.bankErc20ABI, bridge.config.contracts.redeem);
  const countObs = from(backingContract.methods.assetLength().call() as Promise<number>);

  const getToken = (index: number) =>
    from(backingContract.methods.allAssets(index).call() as Promise<string>).pipe(
      switchMap((address) => {
        const infoObs = from(getErc20Meta(address)).pipe(catchError(() => of({})));
        const statusObs = from(getTokenRegisterStatus(address, bridge.config.contracts.redeem));

        const balanceObs = currentAccount
          ? from(getErc20TokenBalance(address, currentAccount))
          : of(Web3.utils.toBN(0));

        return zip(
          [infoObs, statusObs, balanceObs],
          (info, status, balance) =>
            ({
              ...info,
              balance,
              status,
              address,
              source: address,
              backing: backingContract.options.address,
            } as MappingToken)
        );
      })
    );

  return queryMappingTokens(countObs, getToken);
}

function queryMappingTokens(countObs: Observable<number>, token: (index: number) => Observable<MappingToken>) {
  const retryCount = 5;
  const tokensObs = countObs.pipe(
    switchMap((len) => timer(SHORT_DURATION / 10, 0).pipe(take(len))),
    mergeMap((index) => token(index)),
    retry(retryCount),
    scan((acc: MappingToken[], cur: MappingToken) => [...acc, cur], []),
    startWith([])
  );

  return combineLatest([countObs.pipe(retry(retryCount)), tokensObs], (total, tokens) => ({ total, tokens }));
}

/* --------------------------------------------Exported Section------------------------------------------------------- */

/**
 *
 * @params {string} currentAccount - metamask active account
 * @params {string} networkType - eth or darwinia
 * for eth: both address and source fields in result are all represent the token's ethereum address, actually equal
 * for dvm: the address field represent the token's dvm address, the source field represent the token's ethereum address.
 */
export const getKnownMappingTokens = (
  currentAccount: string,
  direction: CrossChainDirection
): Observable<{ total: number; tokens: MappingToken[] }> => {
  if (!currentAccount) {
    return of({ total: 0, tokens: [] });
  }
  const { from: departure, to: arrival } = direction;

  const mappingAddressObs = isSubstrateDVM2Substrate(chainConfigToVertices(departure), chainConfigToVertices(arrival))
    ? from(getS2SMappingAddress(departure.provider.rpc))
    : from(getErc20MappingAddress(departure.provider.rpc));

  const tokens = departure.type.includes('ethereum')
    ? getMappingTokensFromEthereum(currentAccount, direction)
    : mappingAddressObs.pipe(
        switchMap((mappingAddress) =>
          getMappingTokensFromDVM(
            currentAccount,
            departure as DVMChainConfig,
            arrival as EthereumChainConfig,
            mappingAddress
          )
        )
      );

  return connect(departure).pipe(switchMapTo(tokens));
};

/**
 * @params {Address} address - erc20 token address
 */
export const getTokenRegisterStatus: (
  address: string,
  departure: EthereumChainConfig | string,
  provider?: string
) => Promise<RegisterStatus | null> =
  // eslint-disable-next-line complexity
  async (address, departure, provider) => {
    if (!address || !Web3.utils.isAddress(address)) {
      console.warn(`Token address is invalid, except an ERC20 token address. Received value: ${address}`);
      return null;
    }

    const contractAddress =
      typeof departure === 'string' ? departure : getAvailableDVMBridge(departure).config.contracts.redeem;
    const web3 = entrance.web3.getInstance(provider || entrance.web3.defaultProvider);
    const contract = new web3.eth.Contract(abi.bankErc20ABI, contractAddress);
    const { target, timestamp } = await contract.methods.assets(address).call();
    const isTimestampExist = +timestamp > 0;
    let isTargetTruthy = false;

    try {
      // if target exists, the number should be overflow.
      isTargetTruthy = !!Web3.utils.hexToNumber(target);
    } catch (_) {
      isTargetTruthy = true;
    }

    if (isTimestampExist && !isTargetTruthy) {
      return RegisterStatus.registering;
    }

    if (isTimestampExist && isTargetTruthy) {
      return RegisterStatus.registered;
    }

    return RegisterStatus.unregister;
  };

/**
 *
 * @param tokenAddress - token contract address
 * @param account - current active metamask account
 * @returns balance of the account
 */
export async function getErc20TokenBalance(address: string, account: string, isErc20Native = true) {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const tokenAbi = isErc20Native ? abi.Erc20ABI : abi.tokenABI;
  const contract = new web3.eth.Contract(tokenAbi, address);

  try {
    const balance = await contract.methods.balanceOf(account).call();

    return Web3.utils.toBN(balance);
  } catch (err) {
    console.info(
      `%c [ get token(${address}) balance error. account: ${account} ]-52`,
      'font-size:13px; background:pink; color:#bf2c9f;',
      (err as Record<string, string>).message
    );
  }

  return Web3.utils.toBN(0);
}
