/// <reference types="jest" />

import { create } from 'react-test-renderer';
import { Result } from 'shared/model';
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
    const component = create(<TxStatus result={result as Result} />);

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
