/// <reference types="jest" />

import { render } from '@testing-library/react';
import { act, create } from 'react-test-renderer';
import { getActiveNav, Navigator } from '../../components/Navigator';
import { THEME } from '../../config/theme';

jest.mock('next-i18next', () => ({
  useTranslation() {
    return {
      t: (label: string) => label,
    };
  },
}));

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: () => {},
    };
  },
}));

describe('<Navigator />', () => {
  it('render navigator', async () => {
    let component: any;

    await act(async () => {
      component = create(
        <Navigator
          navigators={[
            { label: 'Home', path: '/' },
            { label: 'History', path: '/history' },
          ]}
          theme={THEME.DARK}
        />
      );
    });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('should hide docs', async () => {
    let component: any;

    await act(async () => {
      component = create(
        <Navigator
          navigators={[
            { label: 'Home', path: '/' },
            { label: 'Doc', path: 'doc', hide: true },
          ]}
        />
      );
    });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('should render on small screen size', async () => {
    let component: any;

    await act(async () => {
      component = create(<Navigator navigators={[{ label: 'Home', path: '/' }]} />);
    });

    window.innerHeight = 300;
    window.innerWidth = 500;

    window.dispatchEvent(new Event('resize'));

    expect(window.innerWidth).toBe(500);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('should trigger event listener when the menu clicked', async () => {
    const fn = jest.fn();

    await act(async () => {
      render(<Navigator navigators={[{ label: 'Home', path: '/' }]} onClick={fn} />);
    });

    act(() => {
      const ele = document.querySelector('[data-menu-id="rc-menu-uuid-test-Home"]') as HTMLElement;

      ele.click();
      expect(fn).toBeCalled();
    });
  });

  it('should find active nav', () => {
    const pathname = '/history';
    const navs = [
      { label: 'Home', path: '/' },
      { label: 'History', path: '/history' },
    ];

    const result = getActiveNav(pathname, navs);

    expect(result).toEqual([{ label: 'History', path: '/history' }]);
  });
});
