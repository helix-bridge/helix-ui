import { InfoCircleOutlined } from '@ant-design/icons';
import { Form, InputNumber, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { FORM_CONTROL } from 'shared/config/constant';
import { CrossChainComponentProps } from 'shared/model';

export function SlippageItem({
  onChange,
}: Pick<CrossChainComponentProps, 'form' | 'direction' | 'bridge'> & {
  onChange?: (value: number) => void;
}) {
  const { t } = useTranslation();
  // const initialValue = 0.3;

  useEffect(() => {
    if (onChange) {
      // onChange(initialValue);
    }
  }, []);

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
      initialValue={0.3}
    >
      <InputNumber<number>
        size="large"
        min={0.3}
        max={10}
        step={1}
        formatter={(value) => `${value}%`}
        parser={(value) => Number(value!.replace('%', ''))}
        onChange={(value) => {
          if (onChange) {
            onChange(value);
          }
        }}
        style={{
          width: '100%',
        }}
      />
    </Form.Item>
  );
}
