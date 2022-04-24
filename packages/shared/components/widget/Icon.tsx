import { HelixIcons } from '../../model/icon';

export function Icon({
  onClick,
  name,
  className = '',
}: {
  name: HelixIcons;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <svg className={`icon ${className}`} onClick={() => onClick && onClick()}>
      <use xlinkHref={`#dwa-${name}`}></use>
    </svg>
  );
}
