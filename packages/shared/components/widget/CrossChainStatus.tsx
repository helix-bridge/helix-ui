import { CheckCircleFilled, ClockCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { CrossChainStatus, CrossChainStatusColor } from '../../config/constant';

const StatusIcons = [ClockCircleFilled, CheckCircleFilled, CloseCircleFilled];

export function CrossChainState({ value, className = '' }: { value: number; className?: string }) {
  const Icon = StatusIcons[value];

  return (
    <div
      style={{ backgroundColor: CrossChainStatusColor[value] }}
      className={`flex items-center gap-1 px-2 rounded-xs max-w-max min-w-min h-6 text-gray-200 ${className}`}
    >
      <Icon />
      <span className="h-full">{CrossChainStatus[value]}</span>
    </div>
  );
}
