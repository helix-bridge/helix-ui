/// <reference types="jest" />

import { HistoryItem } from '../../components/record/HistoryItem';
import { create } from 'react-test-renderer';

describe('<HistoryItem />', () => {
  it('render history item', () => {
    const component = create(
      <HistoryItem
        record={{ result: 1, startTime: 1652689116 }}
        token={{ amount: '8', symbol: 'RING', logo: 'ring.svg' }}
        process={<span>Just for test</span>}
      />
    );

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
