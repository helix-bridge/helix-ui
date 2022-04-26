import { abi } from '@helix/shared/config/abi';
import { DarwiniaApiPath } from '@helix/shared/config/api';
import { LONG_DURATION } from '@helix/shared/config/constant';
import { EthereumChainConfig, Tx } from '@helix/shared/model';
import {
  apiUrl,
  ClaimNetworkPrefix,
  encodeBlockHeader,
  encodeMMRRootMessage,
  entrance,
  Erc20RegisterProof,
  genEthereumContractTxObs,
  getAvailableDVMBridge,
  getErc20Meta,
  getMetamaskActiveAccount,
  getMMR,
  getMPTProof,
  getTokenRegisterStatus,
  rxGet,
  StoredProof,
} from '@helix/shared/utils';
import { upperFirst } from 'lodash';
import {
  catchError,
  delay,
  EMPTY,
  forkJoin,
  from,
  map,
  NEVER,
  Observable,
  of,
  retryWhen,
  switchMap,
  tap,
  zip,
} from 'rxjs';
import { convert } from '../../../utils/mmrConvert';

type Erc20RegisterProofRes = Erc20RegisterProof | null;

const proofMemo: StoredProof[] = [];

/**
 * @function getSymbolType - Predicate the return type of the symbol method in erc20 token abi;
 */
const getSymbolType: (address: string) => Promise<{ symbol: string; isString: boolean }> = async (address) => {
  try {
    const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
    const stringContract = new web3.eth.Contract(abi.Erc20StringABI, address);
    const symbol = await stringContract.methods.symbol().call();

    return { symbol, isString: true };
  } catch (error) {
    const { symbol } = await getErc20Meta(address);

    return { symbol, isString: false };
  }
};

/**
 * @description test address 0x1F4E71cA23f2390669207a06dDDef70BDE75b679;
 * @params { Address } address - erc20 token address
 */
export function launchRegister(address: string, departure: EthereumChainConfig): Observable<Tx> {
  const senderObs = from(getMetamaskActiveAccount());
  const symbolObs = from(getSymbolType(address));
  const bridge = getAvailableDVMBridge(departure);

  const hasRegisteredObs = from(getTokenRegisterStatus(address, bridge.config.contracts.redeem)).pipe(
    map((status) => !!status)
  );

  return forkJoin([senderObs, symbolObs, hasRegisteredObs]).pipe(
    switchMap(([sender, { isString }, has]) => {
      return has
        ? EMPTY
        : genEthereumContractTxObs(
            bridge.config.contracts.redeem,
            (contract) => {
              const register = isString ? contract.methods.registerToken : contract.methods.registerTokenBytes32;

              return register(address).send({ from: sender });
            },
            abi.bankErc20ABI
          );
    })
  );
}

export function confirmRegister(proof: StoredProof, departure: EthereumChainConfig): Observable<Tx> {
  const { eventsProof, mmrProof, registerProof } = proof;
  const { signatures, mmr_root, mmr_index, block_header } = registerProof;
  const { peaks, siblings } = mmrProof;
  const senderObs = from(getMetamaskActiveAccount());
  const bridge = getAvailableDVMBridge(departure);

  const mmrRootMessage = encodeMMRRootMessage({
    root: mmr_root,
    prefix: upperFirst(bridge.arrival.name) as ClaimNetworkPrefix,
    methodID: '0x479fbdf9',
    index: +mmr_index,
  });

  const blockHeader = encodeBlockHeader(block_header);

  return senderObs.pipe(
    switchMap((sender) =>
      genEthereumContractTxObs(
        bridge.config.contracts.redeem,
        (contract) =>
          contract.methods
            .crossChainSync(
              mmrRootMessage.toHex(),
              signatures.split(','),
              mmr_root,
              mmr_index,
              blockHeader.toHex(),
              peaks,
              siblings,
              eventsProof
            )
            .send({ from: sender }),
        abi.bankErc20ABI
      )
    )
  );
}

/**
 * @description - 1. querying proof of the register token until the get it.
 * 2. calculate mpt proof and mmr proof then combine them together
 * 3. cache the result and emit it to proof subject.
 */
export const getRegisterProof: (address: string, config: EthereumChainConfig) => Observable<StoredProof> = (
  address,
  config
) => {
  const proofMemoItem = proofMemo.find((item) => item.registerProof.source === address);

  if (proofMemoItem) {
    return of(proofMemoItem);
  }

  const bridge = getAvailableDVMBridge(config);
  const apiObs = from(entrance.polkadot.getInstance(bridge.arrival.provider.rpc).isReady);
  const getMmrFromWsm = getMMR(convert);

  return rxGet<Erc20RegisterProofRes>({
    url: apiUrl(bridge.config.api.dapp, DarwiniaApiPath.issuingRegister),
    params: { source: address },
  }).pipe(
    map((data) => {
      if (!data || !data.mmr_root || !data.signatures) {
        const msg = `The proof of the register token address(${address}) is null, refetch it after ${LONG_DURATION} seconds`;

        throw new Error(msg);
      }

      return data;
    }),
    retryWhen((error) => error.pipe(delay(LONG_DURATION))),
    switchMap((registerProof) => {
      const { block_hash, block_num, mmr_index } = registerProof;
      const mptProof = apiObs.pipe(
        switchMap((api) => getMPTProof(api, block_hash, bridge.config.contracts.proof)),
        map((proof) => proof.toHex()),
        catchError((err) => {
          console.warn(
            '%c [ get MPT proof error ]-216',
            'font-size:13px; background:pink; color:#bf2c9f;',
            err.message,
            block_hash
          );

          return NEVER;
        })
      );
      const mmr = apiObs.pipe(switchMap((api) => getMmrFromWsm(api, block_num, mmr_index, block_hash))).pipe(
        catchError((err) => {
          console.warn(
            '%c [ get MMR proof error ]-228',
            'font-size:13px; background:pink; color:#bf2c9f;',
            err.message,
            block_hash,
            block_num,
            mmr_index
          );

          return NEVER;
        })
      );

      return zip(mptProof, mmr, (eventsProof, mmrProof) => ({
        registerProof,
        mmrProof,
        eventsProof,
      }));
    }),
    tap((proof) => proofMemo.push(proof))
  );
};
