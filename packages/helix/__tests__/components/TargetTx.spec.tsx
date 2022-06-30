/// <reference types="jest" />

import { create } from 'react-test-renderer';
import { HelixHistoryRecord } from 'shared/model';
import { TargetTx } from '../../components/transaction/TargetTx';

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
      query: {
        from: 'darwinia',
        to: 'crab-dvm',
      },
      asPath: '',
    };
  },
}));

describe('<TargetTx />', () => {
  const record: HelixHistoryRecord = {
    amount: '645000000000',
    bridge: 'helix',
    endTime: 1656565938,
    fee: '55000000000',
    feeToken: 'RING',
    fromChain: 'darwinia',
    id: 'darwinia2crabdvm-lock-0x000000000x21e',
    laneId: '0x00000000',
    nonce: '542',
    recipient: '0xceff98a045a3732f3e26247a29ba5e7d52fe84b2',
    requestTxHash: '0xd1937e6d0891d4396b9fefe6411594e97b4f564d00101b9f9d1f1aabeb819fa0',
    responseTxHash: '0x9bde128fdae638facd2c9a3758d14111d8324194b67d4060b8ecad896a79a668',
    result: 1,
    sender: '0xc42226c46028de93a9a3eecabd2412ad97373fcd34ffd8efbfa8ad33c875e604',
    startTime: 1656565854,
    toChain: 'crab-dvm',
    token: '0x6d6f646c64612f6272696e670000000000000000',
  };

  it('render TargetTx', () => {
    const component = create(<TargetTx record={record} />);

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
