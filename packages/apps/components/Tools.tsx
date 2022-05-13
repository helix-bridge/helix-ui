import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Switch, Tooltip } from 'antd';
import { theme } from 'highcharts';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { THEME } from 'shared/config/theme';
import { useConfig } from '../providers';

export function Tools() {
  const { t } = useTranslation();
  const { enableTestNetworks, setEnableTestNetworks } = useConfig();
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <Dropdown
      visible={visible}
      overlay={
        <Menu
          onClick={() => setVisible(true)}
          items={[
            {
              label: (
                <Tooltip
                  title={t('{{enable}} the test networks to appear in the network selection panel', {
                    enable: enableTestNetworks ? t('Disable') : t('Enable'),
                  })}
                >
                  <Button className="flex items-center">
                    <Switch
                      onChange={() => setEnableTestNetworks(!enableTestNetworks)}
                      checked={enableTestNetworks}
                      checkedChildren={<UnlockOutlined />}
                      unCheckedChildren={<LockOutlined />}
                      className="mx-4"
                      style={{
                        lineHeight: 0.5,
                        background:
                          theme === THEME.DARK ? undefined : enableTestNetworks ? 'rgba(0,0,0,.5)' : undefined,
                      }}
                    />
                    <span>{t('Switch test network')}</span>
                  </Button>
                </Tooltip>
              ),
              key: 'switch-chain',
            },
          ]}
        />
      }
      onVisibleChange={(isVisible) => {
        setVisible(isVisible);
      }}
    >
      <Button>•••</Button>
    </Dropdown>
  );
}
