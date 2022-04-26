import { Typography } from 'antd';
import { ReactNode } from 'react';

interface IDescriptionProps {
  title: string | ReactNode;
  content: string | ReactNode;
  icon?: ReactNode;
}

export function IDescription({ title, content, icon }: IDescriptionProps) {
  return (
    <div className="my-4 flex items-center gap-2">
      {icon}
      <div>
        <h4 className="text-gray-400 mb-2">{title}:</h4>
        <Typography.Text>{content}</Typography.Text>
      </div>
    </div>
  );
}
