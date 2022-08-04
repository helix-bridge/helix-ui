import { CopyrightOutlined } from '@ant-design/icons';
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
      className={`flex items-center justify-between z-10 px-0 py-4 container ${className}`}
      style={{
        background: theme === THEME.LIGHT ? '#ccc' : 'transparent',
      }}
    >
      <div className="md:flex md:gap-4 md:flex-wrap dark:text-gray-400">
        <span className="flex items-center justify-center">
          <CopyrightOutlined style={{ fontSize: '0.9rem' }} />
          <span className="ml-1 text-gray-400 text-base font-medium">
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
          <img alt="..." src="/image/github.svg" />
        </a>

        <a
          href="https://twitter.com/helixbridges"
          target="_blank"
          rel="noreferrer"
          className="flex text-gray-400 hover:text-gray-200"
        >
          <img alt="..." src="/image/twitter.svg" />
        </a>

        <a
          href="mailto:hello@helixbridge.app"
          target="_blank"
          rel="noreferrer"
          className="flex text-gray-400 hover:text-gray-200"
        >
          <img alt="..." src="/image/mail.svg" />
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
