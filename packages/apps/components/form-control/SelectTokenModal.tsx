import { AppstoreOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, Radio, Tag, Typography } from 'antd';
import { chain as lodashChain } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { useLocalSearch } from 'shared/hooks';
import { ChainConfig, TokenInfoWithMeta, Network } from 'shared/model';
import { chainConfigs, getDisplayName, isDVMNetwork } from 'shared/utils/network';
import { tokenSearchFactory } from '../../utils';
import { BaseModal } from '../widget/BaseModal';

interface SelectTokenModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (value: TokenInfoWithMeta) => void;
  fromToken?: TokenInfoWithMeta;
}

const colors: { name: Network; color: string }[] = [
  { name: 'crab', color: '#cd201f' },
  { name: 'crab-dvm', color: '#B32BB6' },
  { name: 'darwinia', color: '#FF007A' },
  { name: 'ethereum', color: '#1C87ED' },
  { name: 'ropsten', color: 'blue' },
  { name: 'pangolin', color: 'purple' },
  { name: 'pangolin-dvm', color: 'lime' },
  { name: 'pangoro', color: 'cyan' },
];

const chainColor = (network: Network): string => {
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

  const inPartners = useCallback(
    (target: ChainConfig) => {
      if (!fromToken) {
        return true;
      }

      return !!fromToken.cross.find((cross) => cross.partner.name === target.name);
    },
    [fromToken]
  );

  const allTokens = useMemo(
    () =>
      lodashChain(chainConfigs)
        .filter((item) => !fromToken || (!(fromToken.meta.name === item.name) && inPartners(item)))
        .map((item) =>
          item.tokens
            .filter(
              (token) => !fromToken || removeLeaderCharacters(token.symbol) === removeLeaderCharacters(fromToken.symbol)
            )
            .map((token) => ({ ...token, meta: item }))
        )
        .flatten()
        .value(),
    [fromToken, inPartners]
  );

  const allChains = useMemo(
    () =>
      lodashChain(allTokens)
        .map((item) => item.meta)
        .uniqWith((pre, cure) => pre.name === cure.name)
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
            isDVMNetwork(item.meta);
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

                <Tag color={chainColor(item.meta.name)}>{getDisplayName(item.meta)}</Tag>

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
