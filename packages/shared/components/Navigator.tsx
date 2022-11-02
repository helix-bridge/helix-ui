import { DownOutlined } from '@ant-design/icons';
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';
import { Dropdown, Menu } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { isDev } from 'shared/config/env';
import { THEME } from 'shared/config/theme';
import { useITranslation } from '../hooks/translation';

export interface Nav {
  label: string;
  path: string;
  extra?: boolean;
  hide?: boolean;
  Icon?: (props: AntdIconProps) => JSX.Element;
  className?: string;
  children?: Nav[];
}

interface NavigatorProps {
  navigators: Nav[];
  theme?: THEME;
  onClick?: () => void;
}

function NavLink({ nav, theme }: { nav: Nav; theme: THEME }) {
  const { t } = useITranslation();
  const router = useRouter();
  const textCls = useMemo(() => (theme === 'dark' ? 'text-white' : 'text-pangolin-main'), [theme]);
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
      className={`${active} transition-all duration-300 ease-in-out opacity-100 hover:opacity-80 cursor-pointer whitespace-nowrap`}
      key={nav.label}
    >
      <span className={`text-base font-normal ${textCls}`}>{t(nav.label)}</span>
    </div>
  );
}

function RouteLink({ path, label }: Nav) {
  const { t } = useITranslation();

  return path.includes('http') ? (
    <a href={path} target="_blank" rel="noreferrer">
      {t(label)}
    </a>
  ) : (
    <Link href={path}>{t(label)}</Link>
  );
}

export const getActiveNav = (path: string, navigators: Nav[]) => {
  return navigators
    .filter((item) => path === item.path)
    .map((item) => navigators.find((nav) => nav.path.startsWith(item.path)))
    .filter((item) => !!item) as Nav[];
};

export function Navigator({ navigators, onClick, theme = THEME.DARK }: NavigatorProps) {
  const { t } = useITranslation();
  const { pathname } = useRouter();

  const navItems = useMemo(() => navigators.filter((item) => isDev || (!isDev && !item.hide)), [navigators]);

  const selectedNavMenu = useMemo<string[]>(() => {
    const nav = getActiveNav(pathname, navigators);

    return [nav.length ? nav[0].path : ''];
  }, [pathname, navigators]);

  return (
    <>
      <div className="hidden lg:flex items-center gap-8 ml-8">
        {navItems.map((nav, index) =>
          nav.children ? (
            <Dropdown
              key={index}
              overlay={
                <Menu
                  items={nav.children.map((item, idx) => ({
                    key: item.path + '_' + idx,
                    label: <RouteLink {...item} />,
                  }))}
                />
              }
              className="text-base"
            >
              <div className="flex items-center cursor-pointer">
                <span>{t(nav.label)}</span>
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
        items={navItems.map(({ Icon, path, label, className }) => ({
          key: label,
          label: path ? <Link href={path}>{t(label)}</Link> : t(label),
          icon: Icon ? <Icon /> : null,
          className,
          onClick() {
            if (onClick) {
              onClick();
            }
          },
        }))}
        className="block lg:hidden flex-1"
        style={{ background: theme === THEME.DARK ? 'transparent' : 'inherit' }}
      />
    </>
  );
}
