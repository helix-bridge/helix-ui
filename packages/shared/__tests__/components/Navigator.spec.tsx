/// <reference types="jest" />

import { create } from 'react-test-renderer';
import { Navigator } from '../../components/Navigator';
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
    };
  },
}));

describe('<Navigator />', () => {
  it('render navigator', () => {
    const component = create(
      <Navigator
        navigators={[
          { label: 'Home', path: '/' },
          { label: 'History', path: '/history' },
        ]}
        theme={THEME.DARK}
      />
    );

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
