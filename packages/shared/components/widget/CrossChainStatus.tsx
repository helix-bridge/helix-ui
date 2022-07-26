import {
  CheckCircleFilled,
  ClockCircleFilled,
  ClockCircleOutlined,
  CloseCircleOutlined,
  IssuesCloseOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { CBridgeRecordStatus, RecordStatus } from '../../config/constant';

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
  '#00AA76',
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
  className = '',
}: React.PropsWithChildren<{ value: number; className?: string }>) {
  const Icon = StatusIcons[value];

  return (
    <div
      style={{ backgroundColor: CrossChainStatusColor[value] }}
      className={`flex items-center gap-1 px-2 rounded-xs max-w-max min-w-min h-6 text-gray-200 ${className}`}
    >
      <Icon />
      <span className="h-full">{RecordStatus[value] ?? CBridgeRecordStatus[value]}</span>
      {children}
    </div>
  );
}
