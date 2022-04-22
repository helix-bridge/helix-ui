import { GithubOutlined, GlobalOutlined, TwitterCircleFilled } from '@ant-design/icons';
import Image from 'next/image';
import { useCallback, useMemo } from 'react';
import { BestNumber } from '@helix/shared/components/widget/BestNumber';
import { ChainConfig, LogoType } from '@helix/shared/model';
import { getDisplayName, getNetworkMode } from '@helix/shared/utils';

export type ChainProps = ChainConfig & { logoType?: LogoType };

export function Chain(props: ChainProps) {
  const open = useCallback((url) => {
    window.open(url, '_blank');
  }, []);

  const { social, logos, logoType = 'main' } = props;
  const mode = getNetworkMode(props);

  const logo = useMemo(() => {
    const target = logos.find((item) => item.mode === mode && item.type === logoType);

    return target?.name ?? '';
  }, [logoType, logos, mode]);

  const chainName = getDisplayName(props);

  const { portal, twitter, github } = social;

  return (
    <div className="flex items-center px-6 py-8 gap-6 bg-gray-200 dark:bg-antDark">
      <Image src={`/image/${logo}`} width={70} height={70} />

      <div className="flex flex-col gap-2">
        <h6 className="capitalize">{chainName}</h6>
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
