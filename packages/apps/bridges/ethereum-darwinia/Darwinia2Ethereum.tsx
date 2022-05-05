import { QuestionCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { BN_ZERO } from '@polkadot/util';
import { Button, Descriptions, Form, Spin, Tooltip } from 'antd';
import BN from 'bn.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { EMPTY, from, map, Observable } from 'rxjs';
import { FORM_CONTROL } from 'shared/config/constant';
import { getToken, useDarwiniaAvailableBalances } from 'shared/hooks';
import { AvailableBalance, CrossChainComponentProps, CrossChainPayload, DarwiniaAsset, Token } from 'shared/model';
import { applyModalObs, createTxWorkflow, fromWei, getInfoFromHash, isRing, toWei } from 'shared/utils';
import { AssetGroup } from '../../components/form-control/AssetGroup';
import { PolkadotAccountsItem } from '../../components/form-control/PolkadotAccountsItem';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferSuccess } from '../../components/tx/TransferSuccess';
import { useAfterTx, useApi, useDeparture, useTx } from '../../hooks';
import { Darwinia2EthereumPayload, IssuingDarwiniaTxPayload } from './model';
import { getRedeemFee, issuing } from './utils';

interface AmountCheckInfo {
  fee: BN | null;
  assets: Darwinia2EthereumPayload['assets'];
  availableBalance: AvailableBalance[];
}

const INITIAL_ASSETS: Darwinia2EthereumPayload['assets'] = [
  { asset: DarwiniaAsset.ring, amount: '', checked: true },
  { asset: DarwiniaAsset.kton, amount: '' },
];

/* ----------------------------------------------Base info helpers-------------------------------------------------- */
function TransferInfo({ fee, availableBalance, assets }: AmountCheckInfo) {
  const { chain } = useApi();

  const ringBalance = useMemo(
    () => new BN(availableBalance.find((item) => isRing(item.asset))?.max ?? 0),
    [availableBalance]
  );

  // eslint-disable-next-line complexity
  const isRingBalanceEnough = useMemo(() => {
    if (!fee || ringBalance.eq(BN_ZERO)) {
      return false;
    }

    const ring = assets.find((item) => isRing(item.asset) && item.checked);
    const ringAmount = new BN(toWei({ value: ring?.amount || '0', decimals: 9 }));

    return ring ? ringAmount.gte(fee) && ringAmount.lte(ringBalance) : ringBalance.gte(fee);
  }, [assets, fee, ringBalance]);

  const hasAssetSet = useMemo(() => !!assets.filter((item) => item.checked && item?.amount).length, [assets]);

  const chainSymbol = useCallback(
    (token: DarwiniaAsset) => getToken(chain.tokens, token)?.symbol || token.toUpperCase(),
    [chain.tokens]
  );

  const animationCount = 5;

  if (!fee || ringBalance.eq(BN_ZERO)) {
    return null;
  }

  return (
    <Descriptions
      size="small"
      column={1}
      labelStyle={{ color: 'inherit' }}
      className={`${isRingBalanceEnough ? 'text-green-400' : 'text-red-400 animate-pulse'}`}
      style={{ animationIterationCount: animationCount }}
    >
      {hasAssetSet && (
        <Descriptions.Item label={<Trans>Recipient will receive</Trans>} contentStyle={{ color: 'inherit' }}>
          <p className="flex flex-col">
            {assets.map((item) => {
              if (!item.checked) {
                return null;
              } else {
                const { asset, amount } = item;

                if (isRing(asset)) {
                  const origin = new BN(toWei({ value: amount, decimals: 9 }));

                  return (
                    <span className="mr-2" key={asset}>{`${fromWei({
                      value: origin.sub(fee),
                      decimals: 9,
                    })} ${chainSymbol(DarwiniaAsset.ring)}`}</span>
                  );
                } else {
                  return (
                    <span className="mr-2" key={asset}>{`${amount || 0} ${chainSymbol(DarwiniaAsset.kton)}`}</span>
                  );
                }
              }
            })}
          </p>
        </Descriptions.Item>
      )}

      <Descriptions.Item label={<Trans>Cross-chain Fee</Trans>} contentStyle={{ color: 'inherit' }}>
        <span className="flex items-center">
          {fromWei({ value: fee, decimals: 9 })} {chainSymbol(DarwiniaAsset.ring)}
          <Tooltip
            title={
              <ul className="pl-4 list-disc">
                <li>
                  <Trans>Fee paid per transaction</Trans>
                </li>
                <li>
                  <Trans>If the transaction includes RING, the number of RING cannot be less than the fee</Trans>
                </li>
              </ul>
            }
          >
            <QuestionCircleFilled className="ml-2 cursor-pointer" />
          </Tooltip>
        </span>
      </Descriptions.Item>

      <Descriptions.Item>
        <p className="text-gray-400 text-xs">
          <Trans>Please initiate a claim transaction of the Ethereum network in the Transfer Records.</Trans>
        </p>
      </Descriptions.Item>

      <Descriptions.Item>
        <p className="text-gray-400 text-xs">
          <Trans>Each claim transaction of Ethereum is estimated to use 600,000 Gas.</Trans>
        </p>
      </Descriptions.Item>
    </Descriptions>
  );
}

/* ----------------------------------------------Main Section-------------------------------------------------- */

/**
 * @description test chain: pangolin -> ropsten
 */
export function Darwinia2Ethereum({ form, setSubmit, direction }: CrossChainComponentProps<Darwinia2EthereumPayload>) {
  const { t } = useTranslation();

  const {
    mainConnection: { accounts },
    api,
    chain,
  } = useApi();

  const [availableBalances, setAvailableBalances] = useState<AvailableBalance[]>([]);
  const [crossChainFee, setCrossChainFee] = useState<BN | null>(null);
  const [txFee, setTxFee] = useState<BN | null>(null);
  const [isFeeCalculating, setIsFeeCalculating] = useState<boolean>(false);
  const fee = useMemo(() => (crossChainFee && txFee ? crossChainFee.add(txFee) : null), [crossChainFee, txFee]);
  const [currentAssets, setCurAssets] = useState<Darwinia2EthereumPayload['assets']>([]);
  const { updateDeparture } = useDeparture();
  const { observer } = useTx();
  const { afterCrossChain } = useAfterTx<CrossChainPayload<Darwinia2EthereumPayload>>();
  const getBalances = useDarwiniaAvailableBalances();

  const observe = useCallback(
    (updateFee: React.Dispatch<React.SetStateAction<BN | null>>, source: Observable<BN | null>) => {
      setIsFeeCalculating(true);

      return source.subscribe({
        next: (value) => {
          updateFee(value);
          setIsFeeCalculating(false);
        },
        error: () => setIsFeeCalculating(false),
        complete: () => setIsFeeCalculating(false),
      });
    },
    []
  );

  useEffect(() => {
    const fn = () => (data: IssuingDarwiniaTxPayload) => {
      if (!api || !fee) {
        return EMPTY.subscribe();
      }

      const { assets, sender } = data;

      const assetsToSend = assets?.map((item) => {
        const { asset, amount, checked } = item as Required<Darwinia2EthereumPayload['assets'][number]>;
        const { decimals = 9, symbol = asset } = getToken(chain.tokens, asset as DarwiniaAsset) as Token<DarwiniaAsset>;
        const amountWei = checked ? toWei({ value: amount, decimals }) : '0';

        return {
          asset: symbol,
          decimals,
          amount: isRing(symbol) && new BN(amountWei).gte(fee) ? new BN(amountWei).sub(fee).toString() : amountWei,
        };
      });

      const value = { ...data, assets: assetsToSend };
      const beforeTransfer = applyModalObs({ content: <TransferConfirm value={value} /> });
      const obs = issuing(value, api);

      const afterTransfer = afterCrossChain(TransferSuccess, {
        hashType: 'block',
        onDisappear: () => {
          form.setFieldsValue({
            [FORM_CONTROL.sender]: sender,
            [FORM_CONTROL.assets]: INITIAL_ASSETS,
          });
          getBalances(sender).then(setAvailableBalances);
        },
      })(value);

      return createTxWorkflow(beforeTransfer, obs, afterTransfer).subscribe(observer);
    };

    setSubmit(fn);
  }, [afterCrossChain, api, chain.tokens, fee, form, getBalances, observer, setSubmit]);

  // eslint-disable-next-line complexity
  useEffect(() => {
    const defaultSender = (accounts && accounts[0] && accounts[0].address) || '';
    const { recipient: defaultRecipient } = getInfoFromHash();
    const { sender, recipient, assets } = form.getFieldsValue();
    const sendAccount = sender || defaultSender;

    form.setFieldsValue({
      [FORM_CONTROL.sender]: sendAccount,
      [FORM_CONTROL.assets]: assets || INITIAL_ASSETS,
      [FORM_CONTROL.recipient]: (recipient || defaultRecipient) ?? void 0,
    });

    const sub$$ = observe(setCrossChainFee, from(getRedeemFee(api)));
    const balance$$ = from(getBalances(sendAccount)).subscribe(setAvailableBalances);

    if (assets) {
      setCurAssets(assets);
    }

    updateDeparture({ from: form.getFieldValue(FORM_CONTROL.direction).from, sender });

    return () => {
      sub$$.unsubscribe();
      balance$$.unsubscribe();
    };
  }, [form, api, accounts, updateDeparture, observe, getBalances]);

  useEffect(() => {
    const recipient = form.getFieldValue(FORM_CONTROL.recipient);
    const sender = form.getFieldValue(FORM_CONTROL.sender);
    const { amount, checked } = currentAssets.find((item) => isRing(item.asset)) || {};

    if ([api, recipient, sender].some((item) => !item)) {
      return;
    }

    const extrinsic = api!.tx.balances.transfer(recipient, checked ? new BN(amount ?? 0) : new BN(0));

    const sub$$ = observe(
      setTxFee,
      from(extrinsic.paymentInfo(sender)).pipe(map((info) => new BN(info.partialFee ?? 0)))
    );

    return () => sub$$?.unsubscribe();
  }, [api, currentAssets, form, observe]);

  return (
    <>
      <PolkadotAccountsItem
        availableBalances={availableBalances}
        onChange={(value) => getBalances(value).then(setAvailableBalances)}
      />

      <RecipientItem
        form={form}
        direction={direction}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in the exchange account.'
        )}
      />

      <Form.Item
        name={FORM_CONTROL.assets}
        label={
          <span className="flex items-center">
            <span className="mr-4">{t('Asset')}</span>

            <Tooltip title={t('Refresh balances')} placement="right">
              <Button
                type="link"
                icon={<ReloadOutlined />}
                onClick={() => {
                  form.validateFields(['sender']).then(({ sender }) => {
                    if (sender) {
                      getBalances(sender).then(setAvailableBalances);
                    }
                  });
                }}
                className="flex items-center"
              ></Button>
            </Tooltip>
          </span>
        }
        rules={[{ required: true }]}
        className="mb-0"
      >
        <AssetGroup
          network={form.getFieldValue(FORM_CONTROL.direction).from.name}
          balances={availableBalances}
          fee={fee}
          form={form}
          onChange={(value) => setCurAssets(value)}
        />
      </Form.Item>

      <Spin spinning={isFeeCalculating} size="small">
        <TransferInfo fee={fee} availableBalance={availableBalances} assets={currentAssets} />
      </Spin>
    </>
  );
}
