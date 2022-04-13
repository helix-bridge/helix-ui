import { CopyrightOutlined, GithubOutlined, MailOutlined, TwitterOutlined } from '@ant-design/icons';
import { Divider, Layout } from 'antd';
import { getYear } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { NETWORK_LIGHT_THEME, THEME } from '../../config/theme';
import { LanguageProps } from './Language';
import { ThemeSwitch, ThemeSwitchProps } from './ThemeSwitch';

type FooterProps = LanguageProps & { className?: string } & ThemeSwitchProps;

export function Footer({ network, theme, onThemeChange, className = '' }: FooterProps) {
  const { t } = useTranslation();
  // const color = theme === THEME.LIGHT ? '#0d101d' : undefined;

  return (
    <Layout.Footer
      className={`flex items-center justify-between sm:px-16 px-4 text-gray-400 z-10 py-4 ${className}`}
      style={{
        background:
          theme === THEME.LIGHT ? NETWORK_LIGHT_THEME[network ?? 'pangolin']['@layout-header-background'] : '#020822',
      }}
    >
      <div className="md:flex md:gap-4 md:flex-wrap dark:text-gray-400">
        <span className="flex items-center justify-center">
          <CopyrightOutlined />
          <span className="ml-1">{t('{{year}} Darwinia', { year: getYear(new Date()) })}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="https://github.com/darwinia-network/apps"
          target="_blank"
          rel="noreferrer"
          className="flex text-gray-400 hover:text-gray-200"
        >
          <GithubOutlined />
        </a>

        <a
          href="https://twitter.com/DarwiniaNetwork"
          target="_blank"
          rel="noreferrer"
          className="flex text-gray-400 hover:text-gray-200"
        >
          <TwitterOutlined />
        </a>

        <a
          href="mailto:itering@itering.io"
          target="_blank"
          rel="noreferrer"
          className="flex text-gray-400 hover:text-gray-200"
        >
          <MailOutlined />
        </a>

        <Divider type="vertical" style={{ margin: 0 }} />

        <ThemeSwitch
          defaultTheme={THEME.DARK}
          onThemeChange={onThemeChange}
          mode="btn"
          className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors duration-150"
        />
      </div>
    </Layout.Footer>
  );
}
