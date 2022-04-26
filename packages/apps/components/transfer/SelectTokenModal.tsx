import { SearchOutlined } from '@ant-design/icons';
import { Logo } from '@helix/shared/components/widget/Logo';
import { useLocalSearch } from '@helix/shared/hooks';
import { ChainConfig, TokenInfo, Vertices } from '@helix/shared/model';
import { CROSS_CHAIN_NETWORKS, getDisplayName, isDVM } from '@helix/shared/utils';
import { Input, Radio, Tag, Typography } from 'antd';
import { chain as lodashChain } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';
import { tokenModeToChainMode, tokenSearchFactory } from '../../utils';
import { BaseModal } from '../BaseModal';

interface SelectTokenModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (value: TokenInfoWithMeta) => void;
}

export type TokenInfoWithMeta = TokenInfo & { meta: ChainConfig };

const allTokens: TokenInfoWithMeta[] = lodashChain(CROSS_CHAIN_NETWORKS)
  .filter((item) => !isDVM(item))
  .map((item) => item.tokens.map((token) => ({ ...token, address: '', meta: item }))) // meta: without dvm info; do not treat as DVMConfig
  .flatten()
  .value();

const nullStr = 'null';

const colors: ({ color: string } & Vertices)[] = [
  { network: 'crab', mode: 'native', color: '#cd201f' },
  { network: 'crab', mode: 'dvm', color: '#B32BB6' },
  { network: 'darwinia', mode: 'native', color: '#FF007A' },
  { network: 'ethereum', mode: 'native', color: '#1C87ED' },
  { network: 'ropsten', mode: 'native', color: 'blue' },
  { network: 'pangolin', mode: 'native', color: 'purple' },
  { network: 'pangolin', mode: 'dvm', color: 'lime' },
  { network: 'pangoro', mode: 'native', color: 'cyan' },
];

const chainColor = ({ network, mode }: Vertices): string => {
  const target = colors.find((item) => item.network === network && item.mode === mode);

  return target?.color ?? 'processing';
};

export const SelectTokenModal = ({ visible, onSelect, onCancel }: SelectTokenModalProps) => {
  const { t } = useTranslation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchFn = useCallback(tokenSearchFactory(allTokens), [allTokens]);
  const { data, setSearch } = useLocalSearch(searchFn);
  const [chain, setChain] = useState<string>(nullStr);

  const tokens = useMemo(
    () =>
      data.filter((item) => {
        if (chain === nullStr) {
          return true;
        }

        const mode = tokenModeToChainMode(item.type);

        return getDisplayName(item.meta, mode) === chain;
      }),
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
          setChain(event.target.value);
        }}
      >
        <Radio.Button value={nullStr} className="mt-2 mr-2 capitalize rounded-none">
          {t('All chains')}
        </Radio.Button>

        {CROSS_CHAIN_NETWORKS.map((item, index) => {
          const name = getDisplayName(item);

          return (
            <Radio.Button key={index} value={name} className="mt-2 mr-2 capitalize rounded-none">
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

                <Tag color={chainColor({ network: item.meta.name, mode: tokenModeToChainMode(item.type) })}>
                  {getDisplayName(item.meta, tokenModeToChainMode(item.type))}
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
