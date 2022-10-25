import {
  CheckCircleFilled,
  ClockCircleFilled,
  ClockCircleOutlined,
  CloseCircleOutlined,
  IssuesCloseOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import upperFirst from 'lodash/upperFirst';
import React, { useMemo } from 'react';
import { toMiddleSplitNaming } from 'shared/utils/helper/common';
import { CBridgeRecordStatus, RecordStatus } from '../../config/constant';
import { useITranslation } from '../../hooks/translation';

const StatusIcons = [
  ClockCircleFilled,
  ClockCircleFilled,
  ClockCircleFilled,
  CheckCircleFilled,
  CheckCircleFilled,
  CheckCircleFilled,
  CloseCircleOutlined,
  ClockCircleOutlined,
  IssuesCloseOutlined,
  LoadingOutlined,
  CheckCircleFilled,
];

const CrossChainStatusColor = [
  '#00b3ff',
  '#00b3ff',
  '#00b3ff',
  '#52c41a',
  '#EC9D00',
  '#00AA75',
  '#EC9D01',
  '#00b3fc',
  '#00b3fb',
  '#00b3fa',
  '#00AA74',
];

export function CrossChainState({
  value,
  children,
  detailedState = false,
  className = '',
}: React.PropsWithChildren<{ value: number; className?: string; detailedState?: boolean }>) {
  const { t } = useITranslation();
  const Icon = StatusIcons[value];

  const statusDes = useMemo(() => {
    const state = RecordStatus[value] ?? CBridgeRecordStatus[value];

    return detailedState
      ? toMiddleSplitNaming(state).split('-').map(upperFirst).join(' ')
      : value < RecordStatus.success
      ? 'pending'
      : state;
  }, [value, detailedState]);

  return (
    <div
      style={{ backgroundColor: CrossChainStatusColor[value] }}
      className={`flex items-center gap-1 px-2 rounded-2xl max-w-max min-w-min h-6 text-gray-200 ${className}`}
    >
      <Icon />
      <span className="h-full">{t(statusDes)}</span>
      {children}
    </div>
  );
}
