/// <reference types="jest" />

import { create } from 'react-test-renderer';
import { ViewBoard } from '../../components/transaction/ViewBoard';

describe('<ViewBoard />', () => {
  it('render history item', () => {
    const component = create(<ViewBoard title="transaction" count={90} />);

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
