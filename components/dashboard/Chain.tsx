import { GithubOutlined, GlobalOutlined, TwitterCircleFilled } from '@ant-design/icons';
import Image from 'next/image';
import { BestNumber } from '../../components/widget/BestNumber';
import { ChainConfig, Facade } from '../../model';
import { getDisplayName } from '../../utils';

export interface ChainProps {
  config: ChainConfig;
  logoKey?: keyof Facade;
}

export function Chain({ config, logoKey }: ChainProps) {
  return (
    <div className="flex items-center px-6 py-8 gap-6 bg-antDark">
      <Image src={config.facade[logoKey ?? 'logo'] as string} width={70} height={70} />

      <div className="flex flex-col gap-2">
        <h6 className="capitalize">{getDisplayName(config)}</h6>
        <BestNumber config={config} color={'#1fe733'} />
        <div className="flex gap-2 text-lg">
          <GlobalOutlined />
          <GithubOutlined />
          <TwitterCircleFilled />
        </div>
      </div>
    </div>
  );
}
