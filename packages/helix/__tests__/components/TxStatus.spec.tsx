/// <reference types="jest" />

import { create } from 'react-test-renderer';
import { HelixHistoryRecord, Result } from 'shared/model';
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
    { result: 0, bridgeDispatchError: '' },
    { result: 1, bridgeDispatchError: '' },
    { result: 2, bridgeDispatchError: 'SpecVersionMismatch' },
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
