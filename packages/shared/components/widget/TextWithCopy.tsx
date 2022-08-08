import React, { Typography } from 'antd';
import { PropsWithChildren } from 'react';
import { Icon } from './Icon';

interface Props {
  className?: string;
  underline?: boolean;
}

export const TextWithCopy = ({ children, className, underline }: PropsWithChildren<Props>) => (
  <Typography.Text
    underline={underline}
    copyable={{ icon: <Icon name="copy1" className="text-white text-base" /> }}
    className={`truncate custom-copy-icon ${className}`}
  >
    {children}
  </Typography.Text>
);
