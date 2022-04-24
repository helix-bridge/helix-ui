import { MenuOutlined, HddOutlined } from '@ant-design/icons';
import { Path } from '@helix/shared/config/constant';
import { THEME } from '@helix/shared/config/theme';
import { readStorage } from '@helix/shared/utils';
import { Button, Drawer, Layout, Tooltip } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Footer } from './Footer';
import { Navigator } from './Navigator';

const { Header, Content } = Layout;

function AppLayout({ children }: PropsWithChildren<unknown>) {
  const { t } = useTranslation('common');
  const [theme, setTheme] = useState<THEME>(readStorage().theme ?? THEME.DARK);
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();

  return (
    <Layout className="min-h-screen overflow-scroll">
      <Header
        className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between sm:px-16 px-4 border-b"
        style={{ marginTop: -1, borderColor: '#113b5d' }}
      >
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-2">
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
            <Image alt="..." src="/image/beta.svg" width={35} height={18} />
          </div>
          <span className="hidden lg:inline transition-all duration-300 ease-in-out opacity-100 hover:opacity-80 cursor-pointer whitespace-nowrap">
            Bridge Aggregator
          </span>
          <span className="hidden lg:inline transition-all duration-300 ease-in-out opacity-100 hover:opacity-80 cursor-pointer whitespace-nowrap">
            NFT Bridge
          </span>
        </div>

        <Drawer
          placement="right"
          onClose={() => setCollapsed(true)}
          closable={false}
          visible={!collapsed}
          bodyStyle={{ padding: 0 }}
          className="block lg:hidden"
        >
          <Navigator theme={theme} toggle={() => setCollapsed(true)} />
        </Drawer>

        <div onClick={() => setCollapsed(false)} className="block lg:hidden">
          <MenuOutlined className="text-xl" />
        </div>

        <div className="hidden lg:flex items-center space-x-4">
          <Button>Connect Wallet</Button>
          <Button className="flex items-center" onClick={() => router.push('history')}>
            <HddOutlined />
            History
          </Button>
          <Button>•••</Button>
        </div>
      </Header>

      <Content className="sm:px-16 sm:pt-4 px-4 py-1 my-24 sm:my-20">{children}</Content>

      <Footer onThemeChange={setTheme} />
    </Layout>
  );
}

export default AppLayout;
