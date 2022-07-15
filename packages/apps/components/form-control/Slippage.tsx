import { InfoCircleOutlined } from '@ant-design/icons';
import { Form, InputNumber, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { FORM_CONTROL } from 'shared/config/constant';
import { CrossChainComponentProps } from 'shared/model';

export const DEFAULT_SLIPPAGE = 0.3;

// @see https://github.com/celer-network/sgn-v2-contracts/blob/4881d5b85db2f0e378bf45990054dbcb141d0c7c/contracts/liquidity-bridge/Bridge.sol#L65
export const SLIPPAGE_SCALE = 1e6;

export const UI_SLIPPAGE_SCALE = 1e4;

export function SlippageItem({
  onChange,
}: Pick<CrossChainComponentProps, 'form' | 'direction' | 'bridge'> & {
  onChange?: (value: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <Form.Item
      label={
        <div className="flex items-center gap-2">
          <span>{t('Slippage Tolerance')}</span>
          <Tooltip
            title={t(
              'The transfer won’t go through if the bridge rate moves unfavorably by more than this percentage when the transfer is executed.'
            )}
          >
            <InfoCircleOutlined className="cursor-pointer" />
          </Tooltip>
        </div>
      }
      name={FORM_CONTROL.slippage}
      validateFirst
      validateTrigger="onBlur"
      className="mb-4"
      rules={[{ required: true }]}
      initialValue={DEFAULT_SLIPPAGE}
    >
      <InputNumber<number>
        size="large"
        min={DEFAULT_SLIPPAGE}
        max={10}
        step={1}
        formatter={(value) => `${value}%`}
        parser={(value) => Number(value!.replace('%', ''))}
        onChange={(value) => {
          if (onChange) {
            onChange(value * UI_SLIPPAGE_SCALE);
          }
        }}
        style={{
          width: '100%',
        }}
      />
    </Form.Item>
  );
}
