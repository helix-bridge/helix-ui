/// <reference types="jest" />

import { create } from 'react-test-renderer';
import { HelixHistoryRecord } from 'shared/model';
import { TxStatus } from '../../components/transaction/TxStatus';

jest.mock('next-i18next', () => ({
  useTranslation() {
    return {
      t: (label: string) => label,
    };
  },
}));

describe('<TxStatus />', () => {
  it.each([
    { result: 0, reason: '' },
    { result: 1, reason: 'badSlippage' },
    { result: 2, reason: 'needClaim' },
    { result: 3, reason: '' },
    { result: 4, reason: 'SpecVersionMismatch' },
  ])('render TxStatus: $result', ({ result, ...rest }) => {
    const component = create(<TxStatus record={{ result, ...rest } as HelixHistoryRecord} />);

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should render pending status default', () => {
    const component = create(<TxStatus record={null} />);

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
