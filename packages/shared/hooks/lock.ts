import { FormInstance } from 'antd';
import { useEffect, useState } from 'react';
import { FORM_CONTROL } from '../config/constant';
import { CrossChainPayload, CrossChainDirection } from '../model';

export function useLock(form: FormInstance<CrossChainPayload<{ recipient: string }>>) {
  const [lock, setLock] = useState<boolean>(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const { from, to } = form.getFieldValue(FORM_CONTROL.direction) as CrossChainDirection;
    const needLock = !from || !to;

    setLock(needLock);

    if (needLock) {
      form.setFieldsValue({ [FORM_CONTROL.recipient]: undefined });
    }
  });

  return [lock];
}
