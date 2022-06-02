import { AppstoreOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, Radio, Tag, Typography } from 'antd';
import { chain as lodashChain } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { useLocalSearch } from 'shared/hooks';
import { ChainConfig, TokenInfoWithMeta, Vertices } from 'shared/model';
import { chainConfigs, getDisplayName, isDarwiniaDVMNetwork } from 'shared/utils/network';
import { tokenModeToChainMode, tokenSearchFactory } from '../../utils';
import { BaseModal } from '../widget/BaseModal';

interface SelectTokenModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (value: TokenInfoWithMeta) => void;
  fromToken?: TokenInfoWithMeta;
}

const colors: ({ color: string } & Vertices)[] = [
  { name: 'crab', mode: 'native', color: '#cd201f' },
  // { name: 'crab', mode: 'dvm', color: '#B32BB6' },
  { name: 'darwinia', mode: 'native', color: '#FF007A' },
  { name: 'ethereum', mode: 'native', color: '#1C87ED' },
  { name: 'ropsten', mode: 'native', color: 'blue' },
  { name: 'pangolin', mode: 'native', color: 'purple' },
  // { name: 'pangolin', mode: 'dvm', color: 'lime' },
  { name: 'pangoro', mode: 'native', color: 'cyan' },
];

const chainColor = ({ name: network }: Vertices): string => {
  const target = colors.find((item) => item.name === network);

  return target?.color ?? 'processing';
};

const removeLeaderCharacters = (name: string): string => {
  // ring -> xRING kton -> xKTON CKTON -> WCKTON
  if (name.startsWith('x') || name.startsWith('W')) {
    return name.slice(1);
  }

  return name;
};

export const SelectTokenModal = ({ visible, onSelect, onCancel, fromToken }: SelectTokenModalProps) => {
  const { t } = useTranslation();

  const allTokens = useMemo(
    () =>
      lodashChain(chainConfigs)
        .filter((item) => !fromToken || !(fromToken.meta.name === item.name && fromToken.meta.mode === item.mode))
        .map((item) =>
          item.tokens
            .filter(
              (token) => !fromToken || removeLeaderCharacters(token.symbol) === removeLeaderCharacters(fromToken.symbol)
            )
            .map((token) => ({ ...token, meta: item }))
        )
        .flatten()
        .value(),
    [fromToken]
  );

  const allChains = useMemo(
    () =>
      lodashChain(allTokens)
        .map((item) => item.meta)
        .uniqWith((pre, cure) => pre.name === cure.name && pre.mode === cure.mode)
        .value(),
    [allTokens]
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
    <BaseModal title={t('Select Token')} visible={visible} footer={null} width={540} onCancel={onCancel}>
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
        className="mt-2 mb-3"
        size="small"
        onChange={(event) => {
          setChain(event.target.value as ChainConfig);
        }}
      >
        <Radio.Button value="all" className="mt-2 mr-2 capitalize" style={{ borderRadius: 0 }}>
          {t('All chains')}
        </Radio.Button>

        {allChains.map((item, index) => {
          const name = getDisplayName(item);

          return (
            <Radio.Button key={index} value={item} className="mt-2 mr-2 capitalize" style={{ borderRadius: 0 }}>
              {name}
            </Radio.Button>
          );
        })}
      </Radio.Group>

      <div className="max-h-96 overflow-auto flex flex-col gap-2">
        {/* eslint-disable-next-line complexity */}
        {tokens.map((item, index) => {
          const isS2SKton = /^[x]?[O]?KTON/.test(item.symbol) && !item.address;
          const isAppsFeature =
            ['CKTON', 'PKTON', 'WCKTON', 'WPKTON'].some((name) => item.symbol.includes(name)) &&
            isDarwiniaDVMNetwork(item.meta);
          const disabled = isS2SKton || isAppsFeature;

          return (
            <button
              className={`flex items-center justify-between border border-gray-800 py-3 px-2 cursor-pointer transition-all duration-300  ${
                disabled ? 'bg-gray-700 cursor-not-allowed hover:bg-gray-700' : 'bg-gray-900 hover:bg-gray-800'
              }`}
              key={index}
              disabled={disabled}
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

              {isAppsFeature && (
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    window.open('https://apps.darwinia.network/', '_blank');
                  }}
                  className="inline-flex items-center gap-2 cursor-pointer"
                >
                  <AppstoreOutlined />
                  {t('Go To Apps')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </BaseModal>
  );
};
