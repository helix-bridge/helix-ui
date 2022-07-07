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
  it.each([0, 1, 2])('render TxStatus %s', (result) => {
    const component = create(<TxStatus record={{ result } as HelixHistoryRecord} />);

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should render pending status default', () => {
    const component = create(<TxStatus record={null} />);

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
