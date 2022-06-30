/// <reference types="jest" />

import { HistoryItem } from '../../components/record/HistoryItem';
import { create } from 'react-test-renderer';
import { Button } from 'antd';

jest.useFakeTimers('modern').setSystemTime(new Date('2022-06-17'));

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

  it('render history item with children', () => {
    const component = create(
      <HistoryItem
        record={{ result: 1, startTime: 1652689116 }}
        token={{ amount: '8', symbol: 'RING', logo: 'ring.svg' }}
        process={<span>Just for test</span>}
      >
        <Button>Claim</Button>
      </HistoryItem>
    );

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
