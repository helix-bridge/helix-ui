interface WifiProps {
  strength?: 'weak' | 'medium' | 'none';
  loading?: boolean;
  className?: string;
}

export function Wifi({ strength, loading, className }: WifiProps) {
  return <span className={`wifi ${loading ? 'loading' : strength} ${className}`}></span>;
}
