import {
  CheckCircleFilled,
  ClockCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  IssuesCloseOutlined,
  Loading3QuartersOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { CBridgeRecordStatus, RecordStatus, CrossChainStatusColor } from '../../config/constant';

const StatusIcons = [
  ClockCircleFilled,
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  Loading3QuartersOutlined,
  CheckCircleFilled,
  CloseCircleOutlined,
  ClockCircleOutlined,
  IssuesCloseOutlined,
  LoadingOutlined,
  CheckCircleFilled,
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
