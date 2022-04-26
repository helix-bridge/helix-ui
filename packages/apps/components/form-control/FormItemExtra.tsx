import { PropsWithChildren } from 'react';

export function FormItemExtra({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <span className={` text-xs ml-4 ${className} `}>{children}</span>;
}
