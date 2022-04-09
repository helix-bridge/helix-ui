import { AlertFilled, BulbFilled } from '@ant-design/icons';
import { Button, Switch, SwitchProps } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { NETWORK_DARK_THEME, NETWORK_LIGHT_THEME, SKIN_THEME, THEME } from '../../config/theme';
import { Network } from '../../model';
import { readStorage, updateStorage } from '../../utils/helper/storage';

const toggleTheme = (theme: THEME, network: Network = 'pangolin') => {
  const networkTheme = theme === THEME.DARK ? NETWORK_DARK_THEME : NETWORK_LIGHT_THEME;

  if (typeof window !== 'undefined' && window.less) {
    window.less
      .modifyVars({
        ...SKIN_THEME[theme],
        ...SKIN_THEME.vars,
        ...networkTheme[network],
      })
      .then(() => {
        updateStorage({ theme });
        // Do not read theme from localStorage other than this file. Use readStorage instead.
        localStorage.setItem('theme', theme);
      });
  }
};

interface ThemeSwitchProps extends SwitchProps {
  network?: Network;
  defaultTheme?: THEME;
  onThemeChange?: (theme: THEME) => void;
  mode?: 'switcher' | 'btn';
}

export function ThemeSwitch({
  network,
  mode = 'switcher',
  onThemeChange,
  defaultTheme = THEME.LIGHT,
  className,
  ...others
}: ThemeSwitchProps) {
  const [theme, setTheme] = useState<THEME>(readStorage()?.theme || defaultTheme);
  const toggle = useCallback(() => {
    const current = theme === THEME.DARK ? THEME.LIGHT : THEME.DARK;

    setTheme(current);

    if (onThemeChange) {
      onThemeChange(current);
    }
  }, [onThemeChange, theme]);
  const Icon = useMemo(() => (theme === THEME.DARK ? BulbFilled : AlertFilled), [theme]);

  useEffect(() => {
    toggleTheme(theme, network);

    if (theme === THEME.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [network, theme]);

  return mode === 'switcher' ? (
    <Switch
      checkedChildren="🌜"
      unCheckedChildren="️🌞"
      {...others}
      checked={theme === THEME.DARK}
      onChange={toggle}
      className={className + ' flex items-center'}
    />
  ) : (
    <Button type="link" icon={<Icon />} className={className + ' flex items-center'} onClick={toggle}></Button>
  );
}
