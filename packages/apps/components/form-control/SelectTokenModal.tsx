import { SearchOutlined } from '@ant-design/icons';
import { Input, Radio, Tag } from 'antd';
import uniqWith from 'lodash/uniqWith';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { chainColors } from 'shared/config/theme';
import { useLocalSearch } from 'shared/hooks';
import { ChainConfig, TokenInfoWithMeta } from 'shared/model';
import { chainConfigs, getDisplayName } from 'shared/utils/network';
import { tokenSearchFactory } from '../../utils/token';
import { isTransferableTokenPair } from '../../utils/validate';
import BaseModal from '../widget/BaseModal';

interface SelectTokenModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (value: TokenInfoWithMeta) => void;
  fromToken?: TokenInfoWithMeta;
}

export const SelectTokenModal = ({ visible, onSelect, onCancel, fromToken }: SelectTokenModalProps) => {
  const { t } = useTranslation();

  const allTokens = useMemo(
    () =>
      chainConfigs
        .filter((item) => !fromToken || !!fromToken.cross.find((cross) => cross.partner.name === item.name))
        .map((item) =>
          item.tokens
            .filter((token) => (!fromToken || isTransferableTokenPair(token, fromToken)) && !!token.cross.length)
            .map((token) => ({ ...token, meta: item }))
        )
        .flat(),
    [fromToken]
  );

  const allChains = useMemo(
    () =>
      uniqWith(
        allTokens.map((item) => item.meta),
        (pre, cure) => pre.name === cure.name
      ),
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
        {tokens.map((item, index) => {
          const disabled = false;

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

                <span>{item.name}</span>

                <Tag color={chainColors[item.meta.name] ?? 'processing'}>{getDisplayName(item.meta)}</Tag>

                {item.meta.isTest && (
                  <Tag color="green" className="uppercase">
                    {t('test')}
                  </Tag>
                )}

                {disabled && <span className="text-gray-500 text-xs">{t('COMING SOON')}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </BaseModal>
  );
};
