import { Button, Dropdown, Menu } from 'antd';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { CHAIN_TYPE } from 'shared/config/env';

export function Tools() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <Dropdown
      visible={visible}
      overlay={
        <Menu
          onClick={() => setVisible(true)}
          items={[
            {
              label: <div>{t('Current Chain Environment {{type}}', { type: CHAIN_TYPE })}</div>,
              key: 'chain-type',
            },
          ]}
        />
      }
      overlayStyle={{ border: '1px solid #444A5D', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)', borderRadius: '4px' }}
      onVisibleChange={(isVisible) => {
        setVisible(isVisible);
      }}
    >
      <Button>•••</Button>
    </Dropdown>
  );
}
