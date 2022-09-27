import { SearchOutlined } from '@ant-design/icons';
import { Button, Cascader, Form, Input, InputNumber, InputNumberProps } from 'antd';
import omit from 'lodash/omit';
import { useMemo, useRef, useState } from 'react';
import { Icon } from 'shared/components/widget/Icon';
import { Logo } from 'shared/components/widget/Logo';
import { ChainConfig, CrossToken, TokenInfoWithMeta, TokenWithBridgesInfo } from 'shared/model';
import { isAddress } from 'ethers/lib/utils';
import { chainConfigs, getDisplayName } from 'utils/network';
import { useITranslation } from '../../hooks';
import { isTransferableTokenPair } from '../../utils/validate';

interface DestinationProps {
  className?: string;
  onChange?: (value: CrossToken) => void;
  title?: string;
  value: CrossToken;
  fromToken?: TokenInfoWithMeta;
}

export function Destination({
  title,
  value,
  onChange,
  className,
  disabled,
  fromToken,
}: DestinationProps & Pick<InputNumberProps, 'disabled'>) {
  const { t } = useITranslation();
  const [searchValue, setSearchValue] = useState('');
  const inputNumberEle = useRef<HTMLInputElement>(null);
  console.log('🚀 ~ file: Destination.tsx ~ line 30 ~ searchValue', searchValue);

  const origin = useMemo(
    () =>
      chainConfigs
        .filter((item) => !fromToken || !!fromToken.cross.find((cross) => cross.partner.name === item.name))
        .map((item) => ({
          ...item,
          label: (
            <div className="flex items-center gap-1">
              <Logo width={14} height={14} name={item.logos[0].name} />
              <span>{getDisplayName(item)}</span>
            </div>
          ),
          tokens: item.tokens
            .filter((token) => (!fromToken || isTransferableTokenPair(token, fromToken)) && !!token.cross.length)
            .map((token) => ({
              ...token,
              label: (
                <div className="flex items-center gap-1">
                  <Logo width={14} height={14} name={token.logo} />
                  <span>{token.name}</span>
                </div>
              ),
              cross: token.cross.filter((cross) => !cross.deprecated),
            })),
        }))
        .filter((config) => !!config.tokens.length),
    [fromToken]
  );

  const options = useMemo(() => {
    if (!searchValue) {
      return origin;
    }

    if (isAddress(searchValue)) {
      return origin
        .filter((item) => item.tokens.find((token) => token.address.toLowerCase() === searchValue))
        .map((item) => ({
          ...item,
          tokens: item.tokens.filter((token) => token.address.toLowerCase() === searchValue),
        }));
    }

    return origin.filter((item) => item.name.includes(searchValue));
  }, [origin, searchValue]);

  const width = useMemo(() => {
    if (!inputNumberEle || !inputNumberEle.current) {
      return 'auto';
    }

    const rate = 0.7; // index.scss .destination .ant-input-number-input-wrap width 70%
    const padding = 12;

    return inputNumberEle.current.offsetWidth / rate - padding * 2;
  }, [inputNumberEle]);

  return (
    <Form.Item label={title} className={'relative w-full mb-2 ' + className}>
      <>
        <InputNumber<string>
          value={value?.amount}
          ref={inputNumberEle}
          onChange={(val: string) => {
            if (onChange) {
              onChange({ ...value, amount: val });
            }
          }}
          disabled={disabled}
          size="large"
          style={{
            height: '5rem',
            width: '100%',
            display: 'flex',
          }}
          className="h-20 w-full flex items-center destination"
        />

        <div className="absolute top-0 left-auto right-0 h-20 flex justify-center items-center px-3">
          <Cascader
            options={options}
            placement="bottomRight"
            expandTrigger={'hover'}
            fieldNames={{ value: 'name', children: 'tokens' }}
            dropdownRender={(menus: React.ReactNode) => {
              return (
                <div className="p-2" style={{ width }}>
                  <Input
                    size="small"
                    placeholder={t('Search token address or chain name')}
                    suffix={<SearchOutlined />}
                    className="mb-2"
                    onChange={(event) => {
                      setSearchValue(event.target.value.toLowerCase());
                    }}
                  />
                  {menus}
                </div>
              );
            }}
            onChange={(_, selected) => {
              // selected[0] token information may be incomplete
              const token = (selected as unknown as [ChainConfig, TokenWithBridgesInfo])[1];

              if (onChange) {
                onChange({
                  ...omit(token, 'label'),
                  meta: chainConfigs.find((item) => item.name === token.host)!,
                  amount: value.amount,
                });
              }
            }}
          >
            <Button style={{ height: 'auto' }} className="flex items-center space-x-2 py-2 bg-gray-800 border-none">
              <div className="relative w-10 h-10">
                <Logo name={value.logo} layout="fill" />

                <span className="absolute -bottom-1 right-0">
                  <Logo chain={value.meta} width={12} height={12} />
                </span>
              </div>

              <div className="flex flex-col items-start space-y-px w-24 text-left">
                <strong className="font-medium text-sm truncate w-full">{value.name}</strong>
                <small
                  className="font-light text-xs opacity-60 w-full capitalize truncate"
                  title={getDisplayName(value.meta)}
                >
                  {getDisplayName(value.meta)}
                </small>
              </div>

              <Icon name="down" />
            </Button>
          </Cascader>
        </div>
      </>
    </Form.Item>
  );
}
