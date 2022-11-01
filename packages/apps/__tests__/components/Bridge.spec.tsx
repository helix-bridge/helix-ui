/// <reference types="jest" />

import { create } from 'react-test-renderer';
import { BridgeCategory, HelixHistoryRecord } from 'shared/model';
import { Bridge } from '../../components/transaction/Bridge';
import { getOriginChainConfig } from '../../utils/network';
import s2sv2 from '../fixture/darwin-dvm-crab-dvm.json';

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
    const record = s2sv2[0] as HelixHistoryRecord;
    const component = create(
      <Bridge
        from={getOriginChainConfig(record.fromChain)}
        to={getOriginChainConfig(record.toChain)}
        category={record.bridge.split('-')[0] as BridgeCategory}
      />
    );

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
