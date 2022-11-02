import { MenuOutlined, WarningFilled } from '@ant-design/icons';
import { Drawer, Layout, Tooltip } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { PropsWithChildren, useState } from 'react';
import { Footer } from 'shared/components/Footer';
import { Nav, Navigator } from 'shared/components/Navigator';
import { THEME } from 'shared/config/theme';
import { readStorage } from 'shared/utils/helper/storage';
import { Path } from '../config';
import { useITranslation } from '../hooks';
import { DisclaimerModal } from './widget/DisclaimerModal';
// import { Tools } from './widget/Tools';

const { Header, Content } = Layout;

const navigators: Nav[] = [
  { label: 'Transfer', path: Path.apps },
  { label: 'Explorer', path: Path.records },
  { label: 'Tools', children: [{ label: 'Claim Tool', path: Path.claimTool }], path: '' },
  // { label: 'DAO', path: 'dao' },
  { label: 'Docs', path: 'https://docs.helixbridge.app/', extra: true },
];

// eslint-disable-next-line complexity
function AppLayout({ children }: PropsWithChildren<unknown>) {
  const { t } = useITranslation();
  const [theme, setTheme] = useState<THEME>(readStorage().theme ?? THEME.DARK);
  const [collapsed, setCollapsed] = useState(true);
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const isAppsPage = router.pathname === Path.apps;
  const isHome = router.pathname === '/';

  return (
    <Layout className={`min-h-screen overflow-scroll ${isHome ? 'welcome' : ''}`}>
      <Header
        className="fixed left-0 right-0 top-0 z-40 border-b"
        style={{
          marginTop: -1,
          borderColor: '#113b5d',
          backgroundColor: isHome ? '#151d3582' : '#151d35',
        }}
      >
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <Tooltip title={t('Helix is in beta. Please use at your own risk level')}>
                <Image
                  src="/image/bridges/helix.png"
                  alt="helix"
                  width={90}
                  height={24}
                  onClick={() => router.push('/')}
                  className="cursor-pointer"
                />
              </Tooltip>

              {isAppsPage && (
                <>
                  <Image alt="..." src="/image/beta.svg" width={35} height={18} />
                  <WarningFilled onClick={() => setVisible(true)} className="text-yellow-400" />
                </>
              )}
            </div>

            <Navigator navigators={navigators} theme={theme} />
          </div>

          <Drawer
            placement="right"
            onClose={() => setCollapsed(true)}
            closable={false}
            open={!collapsed}
            bodyStyle={{ padding: 0 }}
            className="block lg:hidden"
          >
            <Navigator navigators={navigators} theme={theme} onClick={() => setCollapsed(true)} />
          </Drawer>

          <div onClick={() => setCollapsed(false)} className="block lg:hidden">
            <MenuOutlined className="text-xl" />
          </div>
        </div>
      </Header>

      <Content className="sm:pt-4 py-1 my-24 sm:my-20 container">{children}</Content>

      <Footer onThemeChange={setTheme} />

      <DisclaimerModal visible={visible} onCancel={() => setVisible(false)} onOk={() => setVisible(false)} />
    </Layout>
  );
}

export default AppLayout;
