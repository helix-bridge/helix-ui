export function Icon({ onClick, name, className = '' }: { name: string; onClick?: () => void; className?: string }) {
  return (
    <svg className={`icon ${className}`} onClick={() => onClick && onClick()}>
      <use xlinkHref={name}></use>
    </svg>
  );
}
