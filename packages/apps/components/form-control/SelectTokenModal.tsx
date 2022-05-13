import { SearchOutlined } from '@ant-design/icons';
import { Input, Radio, Tag, Typography } from 'antd';
import { chain as lodashChain } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { useLocalSearch } from 'shared/hooks';
import { ChainConfig, TokenInfoWithMeta, Vertices } from 'shared/model';
import { chainConfigs, getDisplayName } from 'shared/utils/network';
import { useConfig } from '../../providers';
import { tokenModeToChainMode, tokenSearchFactory } from '../../utils';
import { BaseModal } from '../widget/BaseModal';

interface SelectTokenModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (value: TokenInfoWithMeta) => void;
}

const colors: ({ color: string } & Vertices)[] = [
  { name: 'crab', mode: 'native', color: '#cd201f' },
  { name: 'crab', mode: 'dvm', color: '#B32BB6' },
  { name: 'darwinia', mode: 'native', color: '#FF007A' },
  { name: 'ethereum', mode: 'native', color: '#1C87ED' },
  { name: 'ropsten', mode: 'native', color: 'blue' },
  { name: 'pangolin', mode: 'native', color: 'purple' },
  { name: 'pangolin', mode: 'dvm', color: 'lime' },
  { name: 'pangoro', mode: 'native', color: 'cyan' },
];

const chainColor = ({ name: network, mode }: Vertices): string => {
  const target = colors.find((item) => item.name === network && item.mode === mode);

  return target?.color ?? 'processing';
};

export const SelectTokenModal = ({ visible, onSelect, onCancel }: SelectTokenModalProps) => {
  const { t } = useTranslation();
  const { enableTestNetworks } = useConfig();

  const allTokens = useMemo(
    () =>
      lodashChain(chainConfigs)
        .filter((item) => enableTestNetworks || !item.isTest)
        .map((item) => item.tokens.map((token) => ({ ...token, meta: item })))
        .flatten()
        .value(),
    [enableTestNetworks]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchFn = useCallback(tokenSearchFactory(allTokens), [allTokens]);
  const { data, setSearch } = useLocalSearch(searchFn);
  const [chain, setChain] = useState<ChainConfig | 'all'>('all');

  const tokens = useMemo(
    () => (chain === 'all' ? data : data.filter((item) => getDisplayName(item.meta) === getDisplayName(chain))),
    [chain, data]
  );

  return (
    <BaseModal title="Select a token" visible={visible} footer={null} width={540} onCancel={onCancel}>
      <Input
        suffix={<SearchOutlined />}
        size="large"
        placeholder="Search Symbol or Paste Contract Address"
        onChange={(event) => {
          setSearch(event.target.value);
        }}
      />

      <Radio.Group
        defaultValue={chain}
        buttonStyle="solid"
        className="mt-1"
        size="small"
        onChange={(event) => {
          setChain(event.target.value as ChainConfig);
        }}
      >
        <Radio.Button value="all" className="mt-2 mr-2 capitalize rounded-none">
          {t('All chains')}
        </Radio.Button>

        {chainConfigs
          .filter((item) => enableTestNetworks || !item.isTest)
          .map((item, index) => {
            const name = getDisplayName(item);

            return (
              <Radio.Button key={index} value={item} className="mt-2 mr-2 capitalize rounded-none">
                {name}
              </Radio.Button>
            );
          })}
      </Radio.Group>

      <div className="max-h-96 overflow-auto mt-5">
        <div className="flex flex-col space-y-2">
          {tokens.map((item, index) => (
            <div
              className="flex items-center justify-between border border-gray-800 bg-gray-900 py-3 px-2 cursor-pointer transition-all duration-300 hover:bg-gray-800"
              key={index}
              onClick={() => onSelect(item)}
            >
              <div className="flex items-center space-x-2">
                <Logo name={item.logo} width={36} height={36} />

                <Typography.Text>{item.name}</Typography.Text>

                <Tag color={chainColor({ name: item.meta.name, mode: tokenModeToChainMode(item.type) })}>
                  {getDisplayName(item.meta)}
                </Tag>
                {item.meta.isTest && (
                  <Tag color="green" className="uppercase">
                    {t('test')}
                  </Tag>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  );
};
