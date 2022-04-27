import { FORM_CONTROL } from 'shared/config/constant';
import { isValidAddress } from 'shared/utils';
import { Form, FormInstance, FormItemProps, Input } from 'antd';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useDeparture } from '../../hooks';

interface EthereumAccountItemProps extends FormItemProps {
  form: FormInstance;
}

export function EthereumAccountItem({ form, ...rest }: EthereumAccountItemProps) {
  const { t } = useTranslation();

  const {
    mainConnection: { accounts },
  } = useApi();

  const { updateDeparture } = useDeparture();

  const account = useMemo(() => {
    const acc = (accounts || [])[0];

    return isValidAddress(acc?.address, 'ethereum') ? acc.address : '';
  }, [accounts]);

  useEffect(() => {
    form.setFieldsValue({ [FORM_CONTROL.sender]: account });

    updateDeparture({ from: form.getFieldValue(FORM_CONTROL.direction).from, sender: account });
  }, [account, form, updateDeparture]);

  return (
    <Form.Item name={FORM_CONTROL.sender} rules={[{ required: true }]} label={t('Sender Account')} {...rest}>
      <Input disabled value={account} size="large" />
    </Form.Item>
  );
}
