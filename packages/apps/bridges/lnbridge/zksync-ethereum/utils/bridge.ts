import { BN } from '@polkadot/util';
import { Contract } from 'ethers/lib/ethers';
import { message } from 'antd';
import { ChainConfig, DVMChainConfig, CrossChainDirection, CrossToken, Tx, HelixHistoryRecord } from 'shared/model';
import { entrance, isMetamaskChainConsistent } from 'shared/utils/connection';
import { sendTransactionFromContract } from 'shared/utils/tx';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { from, Observable, switchMap } from 'rxjs';
import { IssuingPayload, RedeemPayload, ZksyncEthereumBridgeConfig } from '../model';
import { LnBridgeBridge } from '../../lnbridge/utils/bridge';
import lpArbitrumL1IssuingAbi from '../config/abi/lnArbitrumL1Issuing.json';

interface RefundParams {
  maxSubmissionCost: BN;
  gasPrice: BN;
  deposit: BN;
}

export class ZksyncEthereumBridge extends LnBridgeBridge<ZksyncEthereumBridgeConfig, DVMChainConfig, DVMChainConfig> {
  static readonly alias: string = 'ZksyncEthereumLnBridge';
  private l2GasLimit = '100000';
  private feeScaler = '1.1';

  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    return this.send(payload, fee);
  }

  burn(payload: RedeemPayload, fee: BN): Observable<Tx> {
    return this.send(payload, fee);
  }

  refund(record: HelixHistoryRecord): Observable<Tx> {
    const { sender, recipient, sendAmount, fromChain, toChain } = record;
    const splitRecords = record.id.split('-');
    const [, sourceChainId, , , transferId] = splitRecords;
    const sendToken = this.getTokenConfigFromHelixRecord(record, 'sendToken');
    const recvToken = this.getTokenConfigFromHelixRecord(record, 'recvToken');

    const { contractAddress, departure, arrival } = this.isIssue(fromChain, toChain)
      ? {
          contractAddress: this.config.contracts!.issuing,
          departure: this.departure,
          arrival: this.arrival,
        }
      : {
          contractAddress: this.config.contracts!.backing,
          departure: this.arrival,
          arrival: this.departure,
        };

    const direction = { from: { meta: arrival }, to: { meta: departure } } as CrossChainDirection<
      CrossToken<DVMChainConfig>,
      CrossToken<DVMChainConfig>
    >;

    return isMetamaskChainConsistent(this.getChainConfig(toChain)).pipe(
      switchMap(() => from(this.getBridgeFee(direction, transferId, false, recipient))),
      switchMap((fee) => {
        if (fee === null) {
          message.error('Some error occurred while getting bridge fee!');
          return EMPTY;
        }
        const args = [
          record.messageNonce,
          recvToken.type === 'native',
          record.recvTokenAddress,
          sender,
          record.recipient,
          sendAmount,
          sourceChainId,
          sendToken.type === 'native',
          fee.maxSubmissionCost.toString(),
          this.l2GasLimit,
          fee.gasPrice.toString(),
        ];
        return sendTransactionFromContract(
          contractAddress,
          (contract) => contract.requestCancelIssuing(...args, { value: fee?.deposit.toString() }),
          lpArbitrumL1IssuingAbi
        );
      })
    );
  }

  async getBridgeFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>,
    transferId: string,
    withdrawNative: boolean,
    receiver: string
  ): Promise<RefundParams | null> {
    const {
      from: { meta: departure },
      to: { meta: arrival },
    } = direction;

    const l1Provider = entrance.web3.getInstance(departure.provider.https);
    const l2Provider = entrance.web3.getInstance(arrival.provider.https);

    try {
      const l1BaseFee = (await l1Provider.getBlock('latest')).baseFeePerGas;
      const l2GasPrice = await l2Provider.getGasPrice();
      const feeScaler = Number(this.feeScaler);
      const scaleL1BaseFee = (Number(l1BaseFee) * feeScaler).toFixed();
      const scaleL2GasPrice = (Number(l2GasPrice) * feeScaler).toFixed();

      const address = this.isIssue(departure, arrival)
        ? this.config.contracts?.backing
        : this.config.contracts?.issuing;
      const contract = new Contract(address as string, lpArbitrumL1IssuingAbi, l1Provider);
      const maxSubmissionCost = await contract.submissionFee(
        scaleL1BaseFee.toString(),
        [transferId],
        withdrawNative,
        receiver,
        10
      );
      const deposit = Number(this.l2GasLimit) * Number(scaleL2GasPrice) + Number(maxSubmissionCost);

      return {
        maxSubmissionCost: new BN(maxSubmissionCost.toString()),
        gasPrice: new BN(scaleL2GasPrice.toString()),
        deposit: new BN(deposit.toString()),
      };
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}
