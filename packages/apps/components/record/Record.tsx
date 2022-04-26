import { ClockCircleOutlined, ImportOutlined, RightOutlined } from '@ant-design/icons';
import { EllipsisMiddle } from '@helix/shared/components/widget/EllipsisMiddle';
import { DATE_TIME_FORMAT } from '@helix/shared/config/constant';
import { ChainConfig } from '@helix/shared/model';
import { Collapse, Progress, Tooltip } from 'antd';
import { format, fromUnixTime } from 'date-fns/esm';
import { PropsWithChildren, useMemo } from 'react';
import { AssetOverview, AssetOverviewProps } from './AssetOverview';
import { ProgressesProps, State } from './Progress';

const { Panel } = Collapse;

export interface RecordProps extends ProgressesProps {
  blockTimestamp: number;
  recipient: string;
  assets: AssetOverviewProps[];
  departure: ChainConfig | null;
  arrival: ChainConfig | null;
}

const PERCENT_HUNDRED = 100;

export function Record({
  assets,
  recipient,
  blockTimestamp,
  departure,
  arrival,
  items,
  children,
}: PropsWithChildren<RecordProps>) {
  const errorProgress = useMemo(
    () => items.find((item) => item.steps.find((step) => step.state === State.error)),
    [items]
  );

  const percent = useMemo(() => {
    const total = items.length;
    const finished = items.filter((item) => item.steps.every((step) => step.state !== State.pending));

    return (finished.length / total) * PERCENT_HUNDRED;
  }, [items]);

  const strokeColor = useMemo(() => {
    if (errorProgress) {
      return '#ef4444';
    }

    return percent === PERCENT_HUNDRED ? '#10b981' : 'normal';
  }, [errorProgress, percent]);

  if (!blockTimestamp) {
    return null;
  }

  return (
    <Collapse key={blockTimestamp} accordion expandIconPosition="right" className="mb-4">
      <Panel
        header={
          <div className="grid grid-cols-3 gap-0 lg:gap-16">
            <div className="flex gap-4 items-center col-span-3 md:col-span-2 md:mr-8">
              <img className="w-6 md:w-12 mx-auto" src={`/image/${departure?.name}.png`} />

              <div className="relative flex items-center justify-around flex-1 col-span-2 h-12 bg-gray-200 dark:bg-gray-900 bg-opacity-50 record-overview">
                <span>
                  {assets.map((asset, index) => (
                    <AssetOverview key={asset.currency ?? index} {...asset} />
                  ))}
                </span>

                <div className="flex items-center">
                  <RightOutlined className="opacity-30" />
                  <RightOutlined className="opacity-60" />
                  <RightOutlined className="opacity-90" />
                </div>

                <Tooltip
                  title={errorProgress?.steps
                    .find((item) => item.state === State.error)
                    ?.deliverMethod?.replace(/([a-z])([A-Z])/g, '$1 $2')}
                  placement="right"
                >
                  <Progress
                    percent={errorProgress ? PERCENT_HUNDRED : percent}
                    steps={items.length}
                    showInfo={false}
                    strokeColor={strokeColor}
                    className="w-full absolute bottom-0 records-progress"
                    style={{ width: 'calc(100% - 3rem)' }}
                  />
                </Tooltip>
              </div>

              <img className="w-6 md:w-12 mx-auto" src={`/image/${arrival?.name}.png`} />
            </div>

            <div className="flex flex-col justify-between ml-0 md:ml-4 mt-2 md:mt-0 col-span-3 md:col-span-1">
              <span className="flex items-center mb-2">
                <ClockCircleOutlined />
                <span className="ml-2">{format(fromUnixTime(blockTimestamp), DATE_TIME_FORMAT) + ' (+UTC)'}</span>
              </span>

              <span className="w-full flex items-center">
                <Tooltip title={recipient} placement="top">
                  <ImportOutlined style={{ transform: 'rotateY(180deg)' }} className="mr-2" />
                </Tooltip>

                <EllipsisMiddle className="flex items-center text-right">{recipient}</EllipsisMiddle>
              </span>
            </div>
          </div>
        }
        key={blockTimestamp}
        className="overflow-hidden"
      >
        {children}
      </Panel>
    </Collapse>
  );
}
