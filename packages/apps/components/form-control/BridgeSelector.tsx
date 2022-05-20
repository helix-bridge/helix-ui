import { ArrowRightOutlined, FrownOutlined } from '@ant-design/icons';
import { Badge, Radio, Result, Space, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { Bridge, CrossChainDirection, CrossToken, CustomFormControlProps, NullableFields } from 'shared/model';
import { getBridges } from 'shared/utils/bridge';
import { getDisplayName } from 'shared/utils/network';

type TokenOnChainProps = {
  token: CrossToken;
  isFrom?: boolean;
};

type BridgeSelectorProps = CustomFormControlProps<Bridge> & {
  direction: NullableFields<CrossChainDirection, 'from' | 'to'>;
};

const TokenOnChain = ({ token, isFrom }: TokenOnChainProps) => (
  <div className="flex items-center text-white">
    <div className={`hidden lg:block relative w-14 h-14 ${isFrom ? 'order-1' : 'order-2 ml-3'}`}>
      <Image src={`/image/${token.logo}`} alt="..." layout="fill" />
      <span className="w-7 h-7 absolute top-auto bottom-1 left-auto -right-3">
        <Image src={`/image/${token.meta?.logos[0].name}`} alt="..." layout="fill" />
      </span>
    </div>

    <div className={`flex flex-col space-y-1 ${isFrom ? 'order-2 lg:ml-6' : 'order-1 items-end'}`}>
      <strong className={`font-medium text-sm ${isFrom ? 'text-left' : 'text-right'}`}>
        {token.amount || '-'} {token.symbol}
      </strong>
      <small className="font-light text-xs opacity-70">on {getDisplayName(token.meta)}</small>
    </div>
  </div>
);

export function BridgeSelector({ direction, value, onChange }: BridgeSelectorProps) {
  const { t } = useTranslation();
  const bridges = getBridges(direction as CrossChainDirection);
  const needClaim = direction.to?.claim;

  return (
    <div className="dark:bg-antDark p-5 overflow-auto" style={{ maxHeight: '65vh', minHeight: '20vh' }}>
      {!bridges.length ? (
        <Result icon={<FrownOutlined />} title="No bridge found for selected tokens" />
      ) : (
        <Radio.Group
          className="w-full"
          size="large"
          value={value}
          onChange={(event) => {
            const nValue = event.target.value;

            if (onChange) {
              onChange(nValue);
            }
          }}
        >
          <Space direction="vertical" className="w-full" size="middle">
            {bridges.map((item, index) => (
              <Badge.Ribbon
                text={
                  needClaim ? (
                    <Tooltip
                      title={t(
                        'Please perform a claim asset operation in the history section after the transfer is submitted.'
                      )}
                    >
                      {t('Need Claim')}
                    </Tooltip>
                  ) : null
                }
                color={needClaim ? 'cyan' : 'transparent'}
                placement="start"
                className="z-50 cursor-help"
                key={index}
              >
                <Radio.Button
                  key={index}
                  className="w-full bg-gray-900 relative"
                  style={{ height: 'fit-content' }}
                  value={item}
                >
                  <div className={`relative flex justify-between items-center pr-3 py-3 ${needClaim ? 'pt-8' : ''}`}>
                    <TokenOnChain token={direction.from as CrossToken} isFrom />

                    <div className="relative w-56 hidden lg:flex justify-center text-white">
                      <div className="py-1 w-24 rounded-3xl bg-gray-700 flex justify-center items-center space-x-2 z-10">
                        <Image alt="..." src={`/image/${item?.category}-bridge.svg`} width={28} height={28} />
                        <strong className="capitalize">{item?.category}</strong>
                      </div>
                      <Image alt="..." src="/image/bridge-to.svg" layout="fill" priority />
                    </div>

                    <div className="lg:hidden absolute top-0 bottom-0 left-0 right-0 m-auto w-7 flex items-end justify-center pb-3 opacity-40">
                      <ArrowRightOutlined />
                    </div>

                    <TokenOnChain token={direction.to as CrossToken} />
                  </div>
                </Radio.Button>
              </Badge.Ribbon>
            ))}
          </Space>
        </Radio.Group>
      )}
    </div>
  );
}
