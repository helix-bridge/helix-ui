import { GithubOutlined, GlobalOutlined, TwitterCircleFilled } from '@ant-design/icons';
import { useCallback } from 'react';
import { BestNumber } from 'shared/components/widget/BestNumber';
import { Logo } from 'shared/components/widget/Logo';
import { ChainConfig } from 'shared/model';
import { getDisplayName } from 'shared/utils/network';

export function Chain(props: ChainConfig) {
  const open = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const { social, logos } = props;
  const chainName = getDisplayName(props);
  const { portal, twitter, github } = social;

  return (
    <div className="flex items-center px-6 py-8 gap-6 bg-gray-200 dark:bg-antDark">
      <Logo name={logos[0].name} width={70} height={70} />

      <div className="flex flex-col gap-2">
        <h6 className="capitalize text-base font-normal text-white">{chainName}</h6>
        <BestNumber config={props} color={'#1fe733'} />
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
