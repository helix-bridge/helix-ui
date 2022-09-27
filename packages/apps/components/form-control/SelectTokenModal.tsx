import { SearchOutlined } from '@ant-design/icons';
import { AutoComplete, Input, Tag, Tooltip } from 'antd';
import uniqWith from 'lodash/uniqWith';
import upperFirst from 'lodash/upperFirst';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { chainColors } from 'shared/config/theme';
import { useLocalSearch } from 'shared/hooks';
import { ChainConfig, TokenInfoWithMeta, TokenWithBridgesInfo } from 'shared/model';
import { isEthereumNetwork, isParachainNetwork, isPolkadotNetwork } from 'shared/utils/network/network';
import { chainConfigs, getDisplayName } from 'utils/network';
import { tokenSearchFactory } from '../../utils/token';
import { isTransferableTokenPair } from '../../utils/validate';
import BaseModal from '../widget/BaseModal';

interface SelectTokenModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (value: TokenInfoWithMeta) => void;
  fromToken?: TokenInfoWithMeta;
}

const isDisable = (token: TokenWithBridgesInfo) => {
  return token.host === 'crab-dvm' && token.name === 'xRING(Classic)';
};

/**
 * @deprecated
 */
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
  const [chain, setChain] = useState<ChainConfig | null>(null);

  const tokens = useMemo(
    () => (!chain ? data : data.filter((item) => getDisplayName(item.meta) === getDisplayName(chain))),
    [chain, data]
  );

  const options = useMemo(() => {
    const groupedChains = allChains.reduce<{ [key: string]: ChainConfig[] }>(
      (acc, cur) => {
        if (isParachainNetwork(cur)) {
          acc.parachain.push(cur);
        } else if (isPolkadotNetwork(cur)) {
          acc.polkadot.push(cur);
        } else if (isEthereumNetwork(cur)) {
          acc.ethereum.push(cur);
        }

        return acc;
      },
      { ethereum: [], polkadot: [], parachain: [] }
    );

    return Object.entries(groupedChains)
      .filter((item) => item[1].length)
      .map((item) => ({
        label: upperFirst(item[0]),
        options: item[1].map((option) => ({
          value: option.name,
          label: (
            <div key={option.name} className="flex justify-between">
              <div className="flex items-center gap-1">
                <Logo width={14} height={14} name={option.logos[0].name} />
                <span>{getDisplayName(option)}</span>
              </div>

              <div className="flex items-center gap-1">
                {option.tokens.map((token) => {
                  const disable = isDisable(token);

                  return (
                    <Tooltip key={option.name + '_' + token.name} title={token.name}>
                      <Logo
                        width={12}
                        height={12}
                        name={token.logo}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!disable) {
                            onSelect({ ...token, meta: option });
                          }
                        }}
                        className={disable ? 'cursor-not-allowed' : 'cursor-pointer'}
                      />
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ),
        })),
      }));
  }, [allChains, onSelect]);

  return (
    <BaseModal title={t('Select Token')} open={visible} footer={null} width={540} onCancel={onCancel}>
      <AutoComplete
        options={options}
        className="w-full mb-4"
        onChange={(value) => {
          if (allChains.find((item) => item.name === value)) {
            setChain(value);
            setSearch('');
          } else {
            setChain(null);
            setSearch(value);
          }
        }}
        allowClear
      >
        <Input size="large" placeholder={t('Search symbol, address or chain')} suffix={<SearchOutlined />} />
      </AutoComplete>

      <div className="max-h-96 overflow-auto flex flex-col gap-2">
        {/* eslint-disable-next-line complexity */}
        {tokens.map((item, index) => {
          const disabled = isDisable(item);

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
