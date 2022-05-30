import { CopyrightOutlined, GithubOutlined, MailOutlined, TwitterOutlined } from '@ant-design/icons';
import { Divider, Layout } from 'antd';
import { getYear } from 'date-fns';
import { LanguageProps } from 'shared/components/widget/Language';
import { ThemeSwitch, ThemeSwitchProps } from 'shared/components/widget/ThemeSwitch';
import { THEME } from 'shared/config/theme';
import { useITranslation } from '../hooks';

type FooterProps = LanguageProps & { className?: string } & ThemeSwitchProps;

export function Footer({ theme, onThemeChange, className = '' }: FooterProps) {
  const { t } = useITranslation();
  // const color = theme === THEME.LIGHT ? '#0d101d' : undefined;

  return (
    <Layout.Footer
      className={`flex items-center justify-between sm:px-16 px-4 z-10 py-4 ${className}`}
      style={{
        background: theme === THEME.LIGHT ? '#ccc' : '#020822',
      }}
    >
      <div className="md:flex md:gap-4 md:flex-wrap dark:text-gray-400">
        <span className="flex items-center justify-center">
          <CopyrightOutlined />
          <span className="ml-1 text-gray-400">
            {t('{{year}} Developed by Helix Team', { year: getYear(new Date()) })}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="https://github.com/helix-bridge"
          target="_blank"
          rel="noreferrer"
          className="flex text-gray-400 hover:text-gray-200"
        >
          <GithubOutlined />
        </a>

        <a
          href="https://twitter.com/helixbridge"
          target="_blank"
          rel="noreferrer"
          className="flex text-gray-400 hover:text-gray-200"
        >
          <TwitterOutlined />
        </a>

        <a
          href="mailto:hello@helixbridge.app"
          target="_blank"
          rel="noreferrer"
          className="flex text-gray-400 hover:text-gray-200"
        >
          <MailOutlined />
        </a>

        <Divider
          type="vertical"
          style={{
            margin: 0,
            borderColor: 'rgba(255, 255, 255, .3)',
            height: '0.5em',
            marginTop: '0.25em',
            display: 'none',
          }}
        />

        <ThemeSwitch
          defaultTheme={THEME.DARK}
          onThemeChange={onThemeChange}
          mode="btn"
          className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors duration-150 hidden"
        />
      </div>
    </Layout.Footer>
  );
}
