import { GithubOutlined, GlobalOutlined, TwitterCircleFilled } from '@ant-design/icons';
import Image from 'next/image';
import { useCallback } from 'react';
import { BestNumber } from '@helix/shared/components/widget/BestNumber';
import { ChainConfig, Facade } from '@helix/shared/model';
import { getDisplayName } from '@helix/shared/utils';

export interface ChainProps {
  config: ChainConfig;
  logoKey?: keyof Facade;
  portal: string;
  github: string;
  twitter: string;
}

export function Chain({ config, logoKey, portal, github, twitter }: ChainProps) {
  const open = useCallback((url) => {
    window.open(url, '_blank');
  }, []);

  return (
    <div className="flex items-center px-6 py-8 gap-6 bg-gray-200 dark:bg-antDark">
      <Image src={config.facade[logoKey ?? 'logo'] as string} width={70} height={70} />

      <div className="flex flex-col gap-2">
        <h6 className="capitalize">{getDisplayName(config)}</h6>
        <BestNumber config={config} color={'#1fe733'} />
        <div className="flex gap-2 text-lg text-gray-400 cursor-pointer">
          <GlobalOutlined
            onClick={() => open(portal)}
            className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
          />

          <GithubOutlined
            onClick={() => open(github)}
            className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
          />

          <TwitterCircleFilled
            onClick={() => open(twitter)}
            className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
          />
        </div>
      </div>
    </div>
  );
}
