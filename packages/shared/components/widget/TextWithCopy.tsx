import { useEffect, useState } from 'react';
import { Icon } from './Icon';

interface Props {
  className?: string;
  children: string;
}

export const TextWithCopy = ({ children, className = '' }: Props) => {
  return (
    <span className={`inline-flex items-center space-x-2 text-white  ${className}`}>
      <span>{children}</span>
      <Copy content={children} />
    </span>
  );
};

export interface CopyProps {
  content: string;
  className?: string;
}

export const Copy = ({ content, className = '' }: CopyProps) => {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let id: NodeJS.Timeout;

    if (isSuccess) {
      id = setTimeout(() => {
        setIsSuccess(false);
      }, 1000);
    }

    return () => {
      if (id) {
        clearTimeout(id);
      }
    };
  }, [isSuccess]);

  return isSuccess ? (
    <Icon name="check" className="text-green-400 w-4 h-4" />
  ) : (
    <Icon
      name="copy1"
      className={`text-base w-4 h-4 cursor-pointer ${className}`}
      onClick={async (event) => {
        event.stopPropagation();

        try {
          await navigator.clipboard.writeText(content);
          setIsSuccess(true);
        } catch (err) {
          setIsSuccess(false);
        }
      }}
    />
  );
};
