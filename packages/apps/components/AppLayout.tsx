import { ContainerOutlined, HddOutlined, MenuOutlined } from '@ant-design/icons';
import { Drawer, Layout, Menu, MenuProps, Tooltip } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PropsWithChildren, useMemo, useState } from 'react';
import { Icon } from 'shared/components/widget/Icon';
import { THEME } from 'shared/config/theme';
import { readStorage } from 'shared/utils/helper';
import { useITranslation } from '../hooks';
import { Footer } from './Footer';
import { Navigator } from './Navigator';
import { Tools } from './Tools';
import { ActiveAccount } from './widget/account/ActiveAccount';

const { Header, Content } = Layout;

function AppLayout({ children }: PropsWithChildren<unknown>) {
  const { t } = useITranslation();
  const [theme, setTheme] = useState<THEME>(readStorage().theme ?? THEME.DARK);
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();

  const menus = useMemo<MenuProps['items']>(
    () => [
      {
        label: <Link href="/">{t('Aggregator')}</Link>,
        key: 'aggregator',
        theme: 'dark',
      },
      {
        label: <Link href="/nft">{t('NFT')}</Link>,
        key: 'nft',
        theme: 'dark',
        disabled: true,
      },
      {
        label: <Link href="/claim">{t('Claim')}</Link>,
        key: 'claim',
        icon: <ContainerOutlined style={{ verticalAlign: 0 }} />,
      },
      {
        label: (
          <span className="inline-flex items-center gap-1">
            <span>{t('History')}</span>
            <Icon name="down" />
          </span>
        ),
        key: 'history',
        icon: <HddOutlined style={{ verticalAlign: 0 }} />,
        children: [
          {
            label: (
              <a href="https://helixbridge.app/transaction" rel="noreferrer" target="_blank">
                {t('History Records')}
              </a>
            ),
            key: 'records',
          },
          {
            label: <Link href="/history">{t('Ethereum - Darwinia Records')}</Link>,
            key: 'ed-history',
          },
        ],
      },
    ],
    [t]
  );

  const activeRouteKeys = useMemo(() => {
    const current = router.pathname.split('/').filter((item) => item);
    if (!current.length) {
      return ['aggregator'];
    }

    return current;
  }, [router.pathname]);

  return (
    <Layout className="min-h-screen overflow-scroll">
      <Header
        className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between sm:px-16 px-4 border-b"
        style={{ marginTop: -1, borderColor: '#113b5d' }}
      >
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

            <Image alt="..." src="/image/beta.svg" width={35} height={18} />
          </div>

          <Menu mode="horizontal" items={menus} selectedKeys={activeRouteKeys} className="bg-transparent" />
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
          <ActiveAccount />

          <Tools />
        </div>
      </Header>

      <Content className="sm:px-16 sm:pt-4 px-4 py-1 my-24 sm:my-20">{children}</Content>

      <Footer onThemeChange={setTheme} />
    </Layout>
  );
}

export default AppLayout;
