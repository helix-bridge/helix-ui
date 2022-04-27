import { abi } from 'shared/config/abi';
import { CrossChainDirection, LockEventsStorage, PolkadotChainConfig, Tx, TxFn } from 'shared/model';
import {
  buf2hex,
  ClaimNetworkPrefix,
  connect,
  encodeBlockHeader,
  encodeMMRRootMessage,
  entrance,
  genEthereumContractTxObs,
  getBridge,
  getMMR,
  getMPTProof,
  isKton,
  isRing,
  signAndSendExtrinsic,
} from 'shared/utils';
import { ApiPromise } from '@polkadot/api';
import { decodeAddress } from '@polkadot/util-crypto';
import { upperFirst } from 'lodash';
import { filter, from, map, Observable, switchMap, take, zip } from 'rxjs';
import { Contract } from 'web3-eth-contract';
import {
  EthereumDarwiniaBridgeConfig,
  IssuingDarwiniaTxPayload,
  RedeemDarwiniaTxPayload,
  RedeemDepositTxPayload,
} from '../model';
import { convert } from '../../../utils/mmrConvert';

interface ClaimInfo {
  direction: CrossChainDirection;
  mmrIndex: number;
  mmrRoot: string;
  mmrSignatures: string;
  blockNumber: number;
  blockHeaderStr: string;
  blockHash: string;
  meta: {
    best: number;
    MMRRoot: string;
  };
}

/**
 * @description darwinia <- ethereum
 * Because of the ring was released in advance on ethereum, so the action is issuing, but follow the Protocol Overview, it should be redeem.
 */
export const redeem: TxFn<RedeemDarwiniaTxPayload> = ({ sender, direction, asset, amount, recipient }) => {
  const { to } = direction;
  const bridge = getBridge<EthereumDarwiniaBridgeConfig>(direction);
  const contractAddress = bridge.config.contracts[asset.toLowerCase() as 'ring' | 'kton'] as string;
  const options = to.isTest ? { from: sender, gasPrice: '500000000000' } : { from: sender };

  recipient = buf2hex(decodeAddress(recipient, false, (to as PolkadotChainConfig).ss58Prefix).buffer);

  return genEthereumContractTxObs(contractAddress, (contract) =>
    contract.methods.transferFrom(sender, bridge.config.contracts.issuing, amount, recipient).send(options)
  );
};

/**
 * @description darwinia <- ethereum
 */
export const redeemDeposit: TxFn<RedeemDepositTxPayload> = ({ direction, recipient, sender, deposit }) => {
  const { to } = direction;
  const bridge = getBridge<EthereumDarwiniaBridgeConfig>(direction);
  recipient = buf2hex(decodeAddress(recipient, false, (to as PolkadotChainConfig).ss58Prefix!).buffer);

  return genEthereumContractTxObs(
    bridge.config.contracts.redeemDeposit,
    (contract) => contract.methods.burnAdnRedeem(deposit, recipient).send({ from: sender }),
    abi.bankABI
  );
};

/**
 * @description darwinia -> ethereum
 */
export function issuing(value: IssuingDarwiniaTxPayload, api: ApiPromise): Observable<Tx> {
  const { sender, recipient, assets } = value;
  const { amount: ring } = assets.find((item) => isRing(item.asset)) || { amount: '0' };
  const { amount: kton } = assets.find((item) => isKton(item.asset)) || { amount: '0' };
  const extrinsic = api.tx.ethereumBacking.lock(ring, kton, recipient);

  return signAndSendExtrinsic(api, sender, extrinsic);
}

function getD2ELockEventsStorageKey(blockNumber: number, lockEvents: LockEventsStorage[] = []) {
  const matchedStorageKey = lockEvents?.find(
    (item) => item.min <= blockNumber && (item.max === null || item?.max >= blockNumber)
  );

  return matchedStorageKey?.key;
}

export function claimToken({
  direction,
  mmrIndex,
  mmrRoot,
  mmrSignatures,
  blockNumber,
  blockHeaderStr,
  blockHash,
  meta: { MMRRoot, best },
}: ClaimInfo): Observable<Tx> {
  const { from: departure, to: arrival } = direction;
  const bridge = getBridge<EthereumDarwiniaBridgeConfig>(direction);
  const networkPrefix = upperFirst(departure.name) as ClaimNetworkPrefix;
  const apiObs = from(entrance.polkadot.getInstance(departure.provider).isReady);
  const header = encodeBlockHeader(blockHeaderStr);
  const storageKey = getD2ELockEventsStorageKey(blockNumber, bridge.config.lockEvents);

  const accountObs = connect(arrival).pipe(
    filter(({ status }) => status === 'success'),
    map(({ accounts }) => accounts[0].address),
    take(1)
  );

  const getMmrFromWsm = getMMR(convert);

  return apiObs.pipe(
    switchMap((api) => {
      const eventsProofObs = from(getMPTProof(api, blockHash, storageKey)).pipe(map((str) => str.toHex()));

      return MMRRoot && best && best > blockNumber
        ? zip([from(getMmrFromWsm(api, blockNumber, best, blockHash)), eventsProofObs, accountObs]).pipe(
            map(
              ([mmrProof, eventsProofStr, account]) =>
                (contract: Contract) =>
                  contract.methods
                    .verifyProof(
                      '0x' + MMRRoot,
                      best,
                      header.toHex(),
                      mmrProof.peaks,
                      mmrProof.siblings,
                      eventsProofStr
                    )
                    .send({ from: account })
            )
          )
        : zip([from(getMmrFromWsm(api, blockNumber, mmrIndex, blockHash)), eventsProofObs, accountObs]).pipe(
            map(([mmrProof, eventsProofStr, account]) => {
              const mmrRootMessage = encodeMMRRootMessage({
                prefix: networkPrefix,
                methodID: '0x479fbdf9',
                index: mmrIndex,
                root: mmrRoot,
              });

              return (contract: Contract) =>
                contract.methods
                  .appendRootAndVerifyProof(
                    mmrRootMessage.toHex(),
                    mmrSignatures.split(','),
                    mmrRoot,
                    mmrIndex,
                    header.toHex(),
                    mmrProof.peaks,
                    mmrProof.siblings,
                    eventsProofStr
                  )
                  .send({ from: account });
            })
          );
    }),
    switchMap((txFn) => genEthereumContractTxObs(bridge.config.contracts.redeem || '', txFn, abi.tokenIssuingABI))
  );
}
