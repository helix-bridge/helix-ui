import { MenuOutlined } from '@ant-design/icons';
import { Button, Drawer, Layout, Tooltip } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Footer } from 'shared/components/Footer';
import { Nav, Navigator } from 'shared/components/Navigator';
import { APPS_DEPLOYMENT } from 'shared/config/env';
import { THEME } from 'shared/config/theme';
import { readStorage } from 'shared/utils/helper';
import { Path } from '../config';

const { Header, Content } = Layout;

const navigators: Nav[] = [
  { label: 'Dashboard', path: Path.root },
  { label: 'Explorer', path: Path.transaction },
  // { label: 'DAO', path: 'dao' },
  { label: 'Docs', path: 'https://docs.helixbridge.app/', extra: true },
];

function AppLayout({ children }: PropsWithChildren<unknown>) {
  const { t } = useTranslation('common');
  const [theme, setTheme] = useState<THEME>(readStorage().theme ?? THEME.DARK);
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();

  return (
    <Layout className="min-h-screen overflow-scroll">
      <Header className="fixed left-0 right-0 top-0 z-40 border-b" style={{ marginTop: -1, borderColor: '#113b5d' }}>
        <div className="container flex items-center justify-between">
          <Tooltip title={t('Helix is in beta. Please use at your own risk level')}>
            <Image
              src="/image/bridges/helix.png"
              alt="helix"
              width={90}
              height={24}
              onClick={() => router.push(Path.root)}
              className="cursor-pointer"
            />
          </Tooltip>

          <Navigator navigators={navigators} theme={theme} />

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

          <div className="hidden lg:flex lg:justify-end items-center lg:flex-1 ml-2 md:ml-8 lg:ml-12">
            <Button
              onClick={() => {
                window.open(APPS_DEPLOYMENT, '_blank');
              }}
              type="primary"
              size="large"
              className="ml-8"
            >
              {t('Launch App')}
            </Button>
          </div>
        </div>
      </Header>

      <Content className="sm:pt-16 py-1 container">{children}</Content>

      <Footer onThemeChange={setTheme} />
    </Layout>
  );
}

export default AppLayout;
