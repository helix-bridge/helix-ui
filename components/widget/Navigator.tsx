import { Dropdown, Menu, Typography } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { THEME } from '../../config/theme';
import { Path } from '../../config/constant';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DownOutlined } from '@ant-design/icons';
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';

const isDev = true;

interface Nav {
  label: string;
  path: Path | string;
  extra?: boolean;
  hide?: boolean;
  Icon?: (props: AntdIconProps) => JSX.Element;
  className?: string;
}

interface NavigatorProps {
  theme?: THEME;
  toggle?: () => void;
}

const navigators: Nav[] = [
  { label: 'Dashboard', path: Path.root },
  { label: 'Explorer', path: Path.transaction },
  { label: 'DAO', path: Path.register },
  { label: 'Docs', path: 'https://docs.darwinia.network/tutorials/wiki-tut-wormhole', extra: true },
];

function NavLink({ nav, theme }: { nav: Nav; theme: THEME }) {
  const { t } = useTranslation();
  const router = useRouter();
  const textCls = useMemo(() => (theme === 'dark' ? '' : 'text-pangolin-main'), [theme]);
  const active =
    nav.path === router.pathname
      ? theme === 'dark'
        ? 'shadow-mock-bottom-border-light'
        : 'shadow-mock-bottom-border'
      : '';

  return (
    <div
      onClick={() => {
        if (nav.extra) {
          window.open(nav.path, '_blank');
        } else if (nav.path) {
          router.push(nav.path);
        } else {
          // nothing
        }
      }}
      className={`${active} ${textCls} transition-all duration-300 ease-in-out opacity-100 hover:opacity-80 cursor-pointer whitespace-nowrap`}
      key={nav.label}
    >
      {t(nav.label)}
    </div>
  );
}

function RouteLink({ path, label }: Nav) {
  const { t } = useTranslation();

  return path.includes('http') ? (
    <Typography.Link href={path} target="_blank">
      {t(label)}
    </Typography.Link>
  ) : (
    <Link href={path}>{t(label)}</Link>
  );
}

const getActiveNav = (path: string) => {
  return navigators
    .filter((item) => path === item.path)
    .map((item) => navigators.find((nav) => nav.path.startsWith(item.path)))
    .filter((item) => !!item) as Nav[];
};

export function Navigator({ toggle, theme = THEME.DARK }: NavigatorProps) {
  const { t } = useTranslation();
  const { pathname } = useRouter();
  const navs = useMemo(() => navigators.filter((item) => isDev || (!isDev && !item.hide)), [isDev]);

  const selectedNavMenu = useMemo<string[]>(() => {
    const nav = getActiveNav(pathname);

    return [nav.length ? nav[0].path : ''];
  }, [pathname]);

  return (
    <>
      <div className="hidden lg:flex items-center gap-8">
        {navs.map((nav, index) =>
          Array.isArray(nav) ? (
            <Dropdown
              key={index}
              overlay={
                <Menu>
                  {nav.slice(1).map((item, idx) => (
                    <Menu.Item key={item.path + '_' + idx}>
                      <RouteLink {...item} />
                    </Menu.Item>
                  ))}
                </Menu>
              }
            >
              <div className="flex items-center">
                <NavLink nav={nav[0]} theme={theme} />
                <DownOutlined className="ml-2" />
              </div>
            </Dropdown>
          ) : (
            <NavLink nav={nav} key={index} theme={theme} />
          )
        )}
      </div>

      <Menu
        theme={theme}
        mode="inline"
        defaultSelectedKeys={selectedNavMenu}
        className="block lg:hidden flex-1"
        style={{ background: theme === THEME.DARK ? 'transparent' : 'inherit' }}
      >
        {navigators.map(({ Icon, path, label, className }) => (
          <Menu.Item
            icon={Icon ? <Icon /> : null}
            key={path}
            className={className}
            onClick={() => {
              if (toggle) {
                toggle();
              }
            }}
          >
            <Link href={path}>{t(label)}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </>
  );
}
