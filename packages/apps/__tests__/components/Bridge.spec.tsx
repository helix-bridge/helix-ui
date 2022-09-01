/// <reference types="jest" />

import { create } from 'react-test-renderer';
import { Bridge } from '../../components/transaction/Bridge';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {
        from: 'darwinia',
        to: 'crab-dvm',
      },
      asPath: '',
    };
  },
}));

describe('<Bridge />', () => {
  it('render bridge', () => {
    const component = create(<Bridge />);

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
