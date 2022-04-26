import { FORM_CONTROL } from '@helix/shared/config/constant';
import { CrossChainPayload, CrossChainDirection } from '@helix/shared/model';
import { FormInstance } from 'antd';
import { useEffect, useState } from 'react';

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
