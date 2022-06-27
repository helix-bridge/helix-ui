import { GlobalOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Dropdown, Menu } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NETWORK_LIGHT_THEME, THEME } from '../../config/theme';
import { Network } from '../../model';

export interface LanguageProps extends ButtonProps {
  className?: string;
  color?: string;
  network?: Network;
  mode?: 'full' | 'icon' | 'text';
  theme?: THEME;
}

const lang: { name: string; short: string }[] = [
  { name: '中文', short: 'zh' },
  { name: 'English', short: 'en' },
];

// eslint-disable-next-line complexity
export function Language({
  network,
  color,
  theme = THEME.LIGHT,
  mode = 'full',
  className = '',
  ...other
}: LanguageProps) {
  const { t, i18n } = useTranslation();
  const [current, setCurrent] = useState(i18n.language.includes('-') ? i18n.language.split('-')[0] : i18n.language);
  const textColor = useMemo(() => (network ? 'text-' + network + '-main' : ''), [network]);

  const calcColor = useMemo(
    () => (theme === THEME.DARK ? network && NETWORK_LIGHT_THEME[network]['@project-main-bg'] : '#fff'),
    [network, theme]
  );

  return (
    <Dropdown
      overlay={
        <Menu
          items={lang.map((item) => ({
            key: item.short,
            label: t(item.name),
            onClick() {
              if (current !== item.name) {
                setCurrent(item.short);
                i18n.changeLanguage(item.short);
              }
            },
          }))}
        />
      }
      className={className}
    >
      {mode === 'icon' ? (
        <GlobalOutlined style={{ color: color ?? calcColor }} className="cursor-pointer" />
      ) : (
        <Button
          {...other}
          className={`${textColor} flex items-center justify-around uppercase`}
          icon={mode === 'full' && <GlobalOutlined style={{ color: color ?? calcColor }} />}
          style={{ color: color ?? calcColor }}
        >
          <span>{current === 'zh' ? '中文' : current}</span>
        </Button>
      )}
    </Dropdown>
  );
}
