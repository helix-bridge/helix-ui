import { ArrowRightOutlined, CheckSquareFilled, SmileOutlined, SyncOutlined } from '@ant-design/icons';
import { Radio, Result, Space, Typography } from 'antd';
import { isEqual } from 'lodash';
import Image from 'next/image';
import { useMemo } from 'react';
import { Bridge, CrossChainDirection, CrossToken, CustomFormControlProps, NullableFields } from 'shared/model';
import { getBridge, getDisplayName, isTransferable } from 'shared/utils';

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
  // TODO: support multi bridges
  const bridge = useMemo(
    () => (isTransferable(direction) ? getBridge(direction as CrossChainDirection) : null),
    [direction]
  );

  const isUnknownBridge = useMemo(() => {
    if (!bridge) {
      return true;
    }

    const [departure, arrival] = bridge.issuing;

    return departure.name === 'pangoro' && arrival.name === 'crab'; // FIXME: pangoro <-> crab is unknown bridge.
  }, [bridge]);

  return (
    <div className="dark:bg-antDark p-5 overflow-auto" style={{ maxHeight: '65vh', minHeight: '20vh' }}>
      <div className="flex items-center space-x-2 mb-2 ml-px">
        <SyncOutlined />
        <Typography.Text>Latest bridge data</Typography.Text>
      </div>

      {isUnknownBridge ? (
        <Result
          icon={<SmileOutlined />}
          title="Please select the parameters for your desired transfer and enter an amount."
        />
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
            <Radio.Button className="w-full bg-gray-900" style={{ height: 'fit-content' }} value={bridge}>
              <div className="relative flex justify-between items-center pr-3 py-3">
                {isEqual(bridge?.issuing, value?.issuing) && (
                  <CheckSquareFilled className="absolute -top-px left-auto -right-4" />
                )}

                <TokenOnChain token={direction.from as CrossToken} isFrom />

                <div className="relative w-56 hidden lg:flex justify-center text-white">
                  <div className="py-1 w-24 rounded-3xl bg-gray-700 flex justify-center items-center space-x-2 z-10">
                    <Image alt="..." src={`/image/${bridge?.category}-bridge.svg`} width={28} height={28} />
                    <strong className="capitalize">{bridge?.category}</strong>
                  </div>
                  <Image alt="..." src="/image/bridge-to.svg" layout="fill" priority />
                </div>

                <div className="lg:hidden absolute top-0 bottom-0 left-0 right-0 m-auto w-7 flex items-end justify-center pb-3 opacity-40">
                  <ArrowRightOutlined />
                </div>

                <TokenOnChain token={direction.to as CrossToken} />
              </div>
            </Radio.Button>
          </Space>
        </Radio.Group>
      )}
    </div>
  );
}
