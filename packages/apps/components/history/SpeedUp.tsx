import { Button, InputNumber, message } from 'antd';
import { EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { revertAccount } from 'shared/utils/helper/address';
import { applyModalObs } from 'shared/utils/tx';
import { fromWei } from 'shared/utils/helper/balance';
import { getBridge } from 'utils/bridge';
import { bridgeFactory } from '../../bridges/bridges';
import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';
import { useTx } from '../../providers';
import { getOriginChainConfig } from '../../utils/network';
import { getDirectionFromHelixRecord, getTokenConfigFromHelixRecord } from '../../utils/record';

export function SpeedUp({ record }: RecordStatusComponentProps) {
  const { t } = useITranslation();
  const { observer } = useTx();
  const speedUpPercent = 1.1;

  return (
    <Button
      size="small"
      type="primary"
      icon={null}
      onClick={(event) => {
        event.stopPropagation();
        const direction = getDirectionFromHelixRecord(record);

        if (!direction) {
          message.error('Can not find the correct transfer direction from record!');
          return null;
        }

        const target = getBridge(direction, 'helixLpBridge');
        const bridge = bridgeFactory(target);

        const feeToken = getTokenConfigFromHelixRecord(record, 'feeToken');
        const fee = Number(fromWei({ value: record.fee, decimals: feeToken!.decimals }));
        const minSpeedUpfee = fee * speedUpPercent;
        let speedUpFee = minSpeedUpfee - fee;
        if (bridge && bridge.speedUp) {
          applyModalObs({
            title: <h3>{t('Confirm To Continue')}</h3>,
            content: (
              <span>
                {t(
                  'The old fee is {{feeAmount}} {{symbol}}. This will speed up this transaction for account {{account}}, are you sure to execute it?',
                  {
                    account: revertAccount(record.sender, getOriginChainConfig(record.fromChain)),
                    feeAmount: fee,
                    symbol: feeToken!.symbol,
                  }
                )}
                <InputNumber<number>
                  size="large"
                  min={minSpeedUpfee}
                  defaultValue={minSpeedUpfee}
                  precision={6}
                  onChange={(value) => {
                    speedUpFee = value - fee;
                  }}
                  style={{
                    width: '50%',
                  }}
                  placeholder={t('Enter new fee')}
                />
              </span>
            ),
          })
            .pipe(switchMap((confirmed) => (confirmed ? bridge.speedUp!(record, speedUpFee) : EMPTY)))
            .subscribe({
              next(response) {
                observer.next(response);
              },
              error(err) {
                observer.error(err);
              },
              complete() {
                observer.complete();
              },
            });
        } else {
          //
        }
      }}
    >
      {t('SpeedUp')}
    </Button>
  );
}
