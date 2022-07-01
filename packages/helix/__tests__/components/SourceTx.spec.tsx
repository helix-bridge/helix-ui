/// <reference types="jest" />

import { create } from 'react-test-renderer';
import { SourceTx } from '../../components/transaction/SourceTx';

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
      query: {},
      asPath: '',
    };
  },
}));

describe('<SourceTx />', () => {
  it('render SourceTx', () => {
    const component = create(<SourceTx hash="0xa9673370dce7f48b306fb96b90c42fa2a13986f1e618eb2996eaeb5abce88643" />);

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
