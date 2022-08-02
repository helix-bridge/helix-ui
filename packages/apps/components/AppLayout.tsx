import { HddOutlined, MenuOutlined } from '@ant-design/icons';
import { Button, Drawer, Layout, Tooltip } from 'antd';
import Image from 'next/image';
import { PropsWithChildren, useState } from 'react';
import { Footer } from 'shared/components/Footer';
import { Nav, Navigator } from 'shared/components/Navigator';
import { HELIX_DEPLOYMENT } from 'shared/config/env';
import { THEME } from 'shared/config/theme';
import { readStorage } from 'shared/utils/helper';
import { useITranslation } from '../hooks';
import { useTx } from '../providers';
import { History } from './history/History';
import { Tools } from './Tools';
import { ActiveAccount } from './widget/account/ActiveAccount';
import { BaseModal } from './widget/BaseModal';

const { Header, Content } = Layout;

const navigators: Nav[] = [{ label: 'Docs', path: 'https://docs.helixbridge.app/', extra: true }];

function AppLayout({ children }: PropsWithChildren<unknown>) {
  const { t } = useITranslation();
  const [theme, setTheme] = useState<THEME>(readStorage().theme ?? THEME.DARK);
  const [collapsed, setCollapsed] = useState(true);
  const { isPersonalHistoryVisible, setIsPersonalHistoryVisible } = useTx();

  return (
    <Layout className="min-h-screen overflow-scroll">
      <Header className="fixed left-0 right-0 top-0 z-40 border-b" style={{ marginTop: -1, borderColor: '#113b5d' }}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <Tooltip title={t('Helix is in beta. Please use at your own risk level')}>
                <Image
                  src="/image/bridges/helix.png"
                  alt="helix"
                  width={90}
                  height={24}
                  onClick={() => window.open(HELIX_DEPLOYMENT, '_blank')}
                  className="cursor-pointer"
                />
              </Tooltip>

              <Image alt="..." src="/image/beta.svg" width={35} height={18} />
            </div>

            <Navigator navigators={navigators} theme={theme} />
          </div>

          <Drawer
            placement="right"
            onClose={() => setCollapsed(true)}
            closable={false}
            visible={!collapsed}
            bodyStyle={{ padding: 0 }}
            className="block lg:hidden"
          >
            <Navigator navigators={navigators} theme={theme} onClick={() => setCollapsed(true)} />
          </Drawer>

          <div onClick={() => setCollapsed(false)} className="block lg:hidden">
            <MenuOutlined className="text-xl" />
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <ActiveAccount />

            <Button icon={<HddOutlined />} onClick={() => setIsPersonalHistoryVisible(true)} className="text-white">
              {t('History')}
            </Button>

            <Tools />
          </div>
        </div>
      </Header>

      <Content className="sm:pt-4 py-1 my-24 sm:my-20 container">{children}</Content>

      <Footer onThemeChange={setTheme} />

      <BaseModal
        title={t('Transfer History')}
        visible={isPersonalHistoryVisible}
        onCancel={() => setIsPersonalHistoryVisible(false)}
        footer={null}
        maskClosable={false}
        wrapClassName="history-modal"
        destroyOnClose
      >
        <History></History>
      </BaseModal>
    </Layout>
  );
}

export default AppLayout;
