import {
  CheckCircleOutlined,
  CheckOutlined,
  ExclamationCircleFilled,
  LoadingOutlined,
  SyncOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { ChainConfig } from 'shared/model';
import { isEthereumNetwork, isPolkadotNetwork } from 'shared/utils/network';
import { Button, Row, Tooltip } from 'antd';
import { last } from 'lodash';
import React, { SetStateAction, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Subscription } from 'rxjs';
import { useTx } from '../../hooks';
import { BridgeDispatchEventRecord } from '../../model';

export enum State {
  pending = 0,
  completed,
  error,
}

// const stateColors: string[] = ['#4b5563', '#5745de', '#da1737'];

interface Step {
  indexing?: IndexingState;
  mutateState?: (monitor: React.Dispatch<SetStateAction<boolean>>) => Subscription;
  state: State;
  txHash?: string;
  blockHash?: string;
  deliverMethod?: BridgeDispatchEventRecord['method'];
}

export interface ProgressProps {
  className?: string;
  icon?: string; // svg image
  network: ChainConfig | null;
  steps: Step[];
  title: React.ReactNode;
}

export interface ProgressesProps {
  items: ProgressProps[];
}

export enum IndexingState {
  indexing = 'indexing',
  success = 'success',
  fail = 'fail',
}

/**
 * @description Each progress could includes multi steps. e.g. s2s origin chain: lock -> confirm
 * progress state depend on every step state
 * - every steps completed, progress completed
 * - if one of the steps error, progress  error
 * - if no error and the last step is no completed, progress pending
 */
// eslint-disable-next-line complexity
export function Progress({ steps, title, icon, className = '', network }: ProgressProps) {
  const { t } = useTranslation();
  const { setCanceler } = useTx();
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const {
    txHash,
    blockHash,
    mutateState,
    indexing,
    state: lastState,
  } = useMemo<Step>(() => last(steps) ?? { name: '', state: State.completed }, [steps]);

  const progressItemState = useMemo<State>(() => {
    if (steps.some((item) => item.state === State.error)) {
      return State.error;
    } else if (steps.every((item) => item.state === State.completed)) {
      return State.completed;
    } else {
      return State.pending;
    }
  }, [steps]);

  // eslint-disable-next-line complexity
  const finish = useMemo(() => {
    if (progressItemState !== State.pending && (txHash || blockHash) && network) {
      return (
        <SubscanLink txHash={txHash} block={blockHash} network={network}>
          <Button size="small" className="text-xs" icon={<CheckOutlined />}>
            {t('Txhash')}
          </Button>
        </SubscanLink>
      );
    }

    if (indexing === IndexingState.indexing) {
      return (
        <Tooltip
          title={t(progressItemState === State.pending ? 'Waiting for bridge response' : 'Querying transaction hash')}
        >
          <Button size="small" className="text-xs" icon={<SyncOutlined spin style={{ verticalAlign: 0 }} />} disabled>
            {t(progressItemState === State.pending ? 'Waiting Deliver' : 'Querying')}
          </Button>
        </Tooltip>
      );
    }

    if (indexing === IndexingState.fail) {
      return (
        <Tooltip title={t('Failed to query transaction hash')}>
          <Button size="small" className="text-xs" icon={<WarningOutlined style={{ verticalAlign: 0 }} />} disabled>
            {t('Querying Failed')}
          </Button>
        </Tooltip>
      );
    }

    return null;
  }, [blockHash, indexing, network, progressItemState, t, txHash]);

  const action = useMemo(() => {
    if (mutateState) {
      return (
        <Button
          disabled={!!isClaiming}
          icon={isClaiming ? <LoadingOutlined /> : null}
          onClick={() => {
            if (mutateState) {
              const subscription = mutateState(setIsClaiming);

              setCanceler(() => () => {
                subscription.unsubscribe();
                setIsClaiming(false);
              });
            }
          }}
          size="small"
        >
          {isClaiming ? (
            t('Claiming')
          ) : (
            <Tooltip title={t('Each claim transaction of Ethereum is estimated to use 600,000 Gas.')}>
              {t('Claim')}
            </Tooltip>
          )}
        </Button>
      );
    }

    if (lastState === State.completed) {
      return <CheckCircleOutlined className="text-xl text-green-500" />;
    }

    return null;
  }, [mutateState, lastState, isClaiming, t, setCanceler]);

  const iconColorCls = useMemo(() => {
    if (isEthereumNetwork(network)) {
      return 'text-gray-700';
    }

    if (isPolkadotNetwork(network)) {
      return `bg-${network?.name}`;
    }

    return `bg-pangolin`;
  }, [network]);

  return (
    <Row
      className={`step flex flex-col justify-around items-center h-36 text-center text-xs md:text-base after:bg-pangolin ${className}`}
    >
      <Row
        className={`flex flex-col justify-center items-center ${
          progressItemState === State.pending ? 'opacity-30' : 'opacity-100'
        }`}
      >
        <div className="relative">
          {/* Jagged when adding backgrounds to svg containers, so use image here */}
          <img
            src={`${icon?.includes('/image/') ? '' : '/image/'}${icon ?? network?.name + '.png'}`}
            className={` w-4 md:w-10 rounded-full overflow-hidden ${iconColorCls} `}
          />
          {progressItemState === State.error && (
            <Tooltip
              title={steps
                .find((item) => item.state === State.error)
                ?.deliverMethod?.replace(/([a-z])([A-Z])/g, '$1 $2')}
            >
              <ExclamationCircleFilled className="absolute -top-1 -right-1 text-red-500 text-xs" />
            </Tooltip>
          )}
        </div>
        <span className="capitalize mt-4 dark:text-gray-200 text-gray-900">{title}</span>
      </Row>
      <Row style={{ minHeight: 24 }}>{finish || action}</Row>
    </Row>
  );
}

export function Progresses({ items }: ProgressesProps) {
  const cols = useMemo(() => items.length, [items.length]);

  return (
    <div
      className="grid bg-gray-300 dark:bg-gray-800 bg-opacity-20 progress-steps"
      /* when using tailwind purge, class name like grid-cols-${cols} can not be recognized */
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {items.map((item, index) => (
        <Progress {...item} key={index} />
      ))}
    </div>
  );
}
