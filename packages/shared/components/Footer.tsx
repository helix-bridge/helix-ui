import { CopyrightOutlined, GithubOutlined, MailOutlined, TwitterOutlined } from '@ant-design/icons';
import { Divider, Layout } from 'antd';
import { getYear } from 'date-fns';
import { LanguageProps } from 'shared/components/widget/Language';
import { ThemeSwitchProps } from 'shared/components/widget/ThemeSwitch';
import { THEME } from 'shared/config/theme';
import { useEffect, useState } from 'react';
import { useITranslation } from '../hooks/translation';

type FooterProps = LanguageProps & { className?: string } & ThemeSwitchProps;

export function Footer({ theme, className = '' }: FooterProps) {
  const { t } = useITranslation();
  const [mainnetOrTestnet, setMainnetOrTestnet] = useState<{ label: 'Mainnet' | 'Testnet'; link: string }>();

  useEffect(() => {
    if (window.location.hostname === 'helixbridge.app') {
      setMainnetOrTestnet({ label: 'Testnet', link: 'helix-apps-test.vercel.app' });
    } else if (window.location.hostname === 'helix-apps-test.vercel.app') {
      setMainnetOrTestnet({ label: 'Mainnet', link: 'helixbridge.app' });
    } else if (window.location.hostname === 'helix-stg.vercel.app') {
      setMainnetOrTestnet({ label: 'Testnet', link: 'helix-stg-test.vercel.app' });
    } else if (window.location.hostname === 'helix-stg-test.vercel.app') {
      setMainnetOrTestnet({ label: 'Mainnet', link: 'helix-stg.vercel.app' });
    }
  }, []);

  return (
    <Layout.Footer
      className={`flex items-center justify-between z-10 px-0 py-4 container ${className}`}
      style={{
        background: theme === THEME.LIGHT ? '#ccc' : 'transparent',
      }}
    >
      <div className="md:flex md:gap-4 md:flex-wrap text-gray-400">
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
          <GithubOutlined style={{ fontSize: '1.25rem' }} />
        </a>

        <a
          href="https://twitter.com/helixbridges"
          target="_blank"
          rel="noreferrer"
          className="flex text-gray-400 hover:text-gray-200"
        >
          <TwitterOutlined style={{ fontSize: '1.25rem' }} />
        </a>

        <a
          href="mailto:hello@helixbridge.app"
          target="_blank"
          rel="noreferrer"
          className="flex text-gray-400 hover:text-gray-200"
        >
          <MailOutlined style={{ fontSize: '1.25rem' }} />
        </a>

        {mainnetOrTestnet && (
          <>
            <div className="w-[1px] h-3 bg-white/30" />
            <a
              className="text-gray-400 text-sm font-bold hover:underline"
              target="_blank"
              rel="noreferrer"
              href={mainnetOrTestnet.link}
            >
              {mainnetOrTestnet.label}
            </a>
          </>
        )}

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
      </div>
    </Layout.Footer>
  );
}
