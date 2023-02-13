import { BN } from '@polkadot/util';
import { Contract } from 'ethers/lib/ethers';
import { message } from 'antd';
import { ChainConfig, DVMChainConfig, CrossChainDirection, CrossToken, HelixHistoryRecord, Tx } from 'shared/model';
import { entrance, isMetamaskChainConsistent } from 'shared/utils/connection';
import { sendTransactionFromContract } from 'shared/utils/tx';
import { isNativeToken } from 'shared/utils/helper/validator';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { from, Observable, switchMap } from 'rxjs';
import { IssuingPayload, RedeemPayload, DarwiniaEthereumBridgeConfig } from '../model';
import { TokenWithAmount } from '../../../../core/bridge';
import { HelixLpBridgeBridge } from '../../helixLpBridge/utils/bridge';
import sub2ethLpBridgeAbi from '../config/abi/sub2ethlpbridge.json';
import lpBridgeAbi from '../../helixLpBridge/config/abi/lpbridge.json';

export class DarwiniaEthereumBridge extends HelixLpBridgeBridge<
  DarwiniaEthereumBridgeConfig,
  DVMChainConfig,
  DVMChainConfig
> {
  static readonly alias: string = 'DarwiniaEthereumBridge';
  private gasLimit = '1000000';

  back(payload: IssuingPayload, fee: BN) {
    return this.send(payload, fee);
  }

  burn(payload: RedeemPayload, fee: BN) {
    return this.send(payload, fee);
  }

  refund(record: HelixHistoryRecord): Observable<Tx> {
    const { sender, sendAmount, fromChain, toChain } = record;
    const splitRecords = record.id.split('-');
    const sourceChainId = splitRecords[1];
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

    const args = [
      record.messageNonce,
      recvToken.type === 'native',
      record.recvTokenAddress,
      sender,
      record.recipient,
      sendAmount,
      sourceChainId,
      sendToken.type === 'native',
    ];

    const direction = { from: { meta: arrival }, to: { meta: departure } } as CrossChainDirection<
      CrossToken<DVMChainConfig>,
      CrossToken<DVMChainConfig>
    >;

    return isMetamaskChainConsistent(this.getChainConfig(toChain)).pipe(
      switchMap(() => from(this.getBridgeFee(direction))),
      switchMap((fee) => {
        if (fee === null) {
          message.error('Some error occurred while getting bridge fee!');
          return EMPTY;
        }
        return sendTransactionFromContract(
          contractAddress,
          (contract) => contract.requestCancelIssuing(...args, { value: fee?.amount.toString() }),
          sub2ethLpBridgeAbi
        );
      })
    );
  }

  async getBridgeFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<TokenWithAmount | null> {
    const {
      from: { meta: departure },
      to: { meta: arrival },
    } = direction;
    const token = departure.tokens.find((item) => isNativeToken(item))!;

    const address = this.isIssue(departure, arrival) ? this.config.contracts?.backing : this.config.contracts?.issuing;
    const contract = new Contract(
      address as string,
      sub2ethLpBridgeAbi,
      entrance.web3.getInstance(departure.provider.https)
    );

    try {
      const endpoint = await contract.localEndpoint();
      const endpointContract = new Contract(endpoint, lpBridgeAbi, entrance.web3.getInstance(departure.provider.https));
      const fee = await endpointContract.fee();

      return { ...token, amount: new BN(fee.toString()) };
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}
