import { BN_ZERO } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { upperFirst } from 'lodash';
import { filter, from, map, Observable, switchMap, take, zip } from 'rxjs';
import { abi } from 'shared/config/abi';
import { ChainConfig, LockEventsStorage, PolkadotChainConfig, RequiredPartial, Tx, TxFn } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { connect, entrance } from 'shared/utils/connection';
import { encodeBlockHeader, isKton, isRing, toWei } from 'shared/utils/helper';
import { ClaimNetworkPrefix, encodeMMRRootMessage, getMMR } from 'shared/utils/mmr';
import { buf2hex, genEthereumContractTxObs, getMPTProof, signAndSendExtrinsic } from 'shared/utils/tx';
import { Contract } from 'web3-eth-contract';
import { TxValidationMessages } from '../../../config/validation';
import { TxValidation } from '../../../model';
import { validationObsFactory } from '../../../utils/tx';
import { EthereumDarwiniaBridgeConfig, IssuingPayload, RedeemPayload } from '../model';

interface ClaimInfo {
  direction: { from: ChainConfig; to: ChainConfig };
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
export const issuing: TxFn<IssuingPayload> = ({ sender, direction, recipient, bridge }) => {
  const {
    from: { address },
    to,
  } = direction;
  const options = to.meta.isTest ? { from: sender, gasPrice: '500000000000' } : { from: sender };

  recipient = buf2hex(decodeAddress(recipient, false, (to.meta as PolkadotChainConfig).ss58Prefix).buffer);

  return genEthereumContractTxObs(address, (contract) =>
    contract.methods
      .transferFrom(sender, bridge.config.contracts.issuing, toWei({ value: to.amount }), recipient)
      .send(options)
  );
};

/**
 * @description darwinia -> ethereum
 */
export function redeem({ sender, recipient, direction }: RedeemPayload): Observable<Tx> {
  const {
    from: { symbol, amount, decimals },
  } = direction;
  const num = toWei({ value: amount, decimals });
  const api = entrance.polkadot.getInstance(direction.from.meta.provider);

  const extrinsic = api.tx.ethereumBacking.lock(isRing(symbol) ? num : '0', isKton(symbol) ? num : '0', recipient);

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
  const bridge = getBridge<EthereumDarwiniaBridgeConfig>([direction.from, direction.to]);
  const networkPrefix = upperFirst(departure.name) as ClaimNetworkPrefix;
  const apiObs = from(entrance.polkadot.getInstance(departure.provider).isReady);
  const header = encodeBlockHeader(blockHeaderStr);
  const storageKey = getD2ELockEventsStorageKey(blockNumber, bridge.config.lockEvents);

  const accountObs = connect(arrival).pipe(
    filter(({ status }) => status === 'success'),
    map(({ accounts }) => accounts[0].address),
    take(1)
  );

  return apiObs.pipe(
    switchMap((api) => {
      const eventsProofObs = from(getMPTProof(api, blockHash, storageKey)).pipe(map((str) => str.toHex()));

      return MMRRoot && best && best > blockNumber
        ? zip([from(getMMR(api, blockNumber, best, blockHash)), eventsProofObs, accountObs]).pipe(
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
        : zip([from(getMMR(api, blockNumber, mmrIndex, blockHash)), eventsProofObs, accountObs]).pipe(
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

type ITxValidation = RequiredPartial<TxValidation, 'balance' | 'amount' | 'fee'> & { ringBalance: BN };

const genValidations = ({ balance, amount, fee, ringBalance, allowance }: ITxValidation): [boolean, string][] => [
  [ringBalance.lt(fee), TxValidationMessages.balanceLessThanFee],
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
  [!!allowance && allowance.lt(amount), TxValidationMessages.allowanceLessThanAmount],
  [!!fee && fee?.lt(BN_ZERO), TxValidationMessages.invalidFee],
];

export const validate = validationObsFactory(genValidations);
