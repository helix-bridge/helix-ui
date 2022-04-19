import Image from 'next/image';
import { Radio, Space } from 'antd';
import { useState } from 'react';

type TokenOnChainData = {
  tokenIcon: string;
  chainIcon: string;
  chainName: string;
  from?: boolean;
};

const TokenOnChain = ({ tokenIcon, chainIcon, chainName, from }: TokenOnChainData) => (
  <div className='flex items-center'>
    <div className={`relative w-14 h-14 ${from ? 'order-1' : 'order-2 ml-3'}`}>
      <Image src={tokenIcon} alt="..." layout="fill" />
      <span className="w-7 h-7 absolute top-auto bottom-1 left-auto -right-3">
        <Image src={chainIcon} alt="..." layout="fill" />
      </span>
    </div>
    <div className={`flex flex-col ${from ? 'order-2 ml-6' : 'order-1 items-end'}`}>
      <strong>33,456.3762 RING</strong>
      <small>on {chainName}</small>
    </div>
  </div>
);

const SelectorItem = ({ value }: { value: number }) => {
  return (
    <Radio.Button className='w-full' style={{ height: 'fit-content' }} value={value}>
      <div className="relative flex justify-between items-center pr-3">
        <TokenOnChain tokenIcon="/image/ring.svg" chainIcon="/image/darwinia.png" chainName='Darwinia' from />
        <div className="relative w-56 flex justify-center">
          <div className="py-1 w-24 rounded-3xl bg-gray-700 flex justify-center items-center space-x-2 z-10">
            <Image alt='...' src='/image/helix-bridge.svg' width={28} height={28} />
            <strong>Helix</strong>
          </div>
          <Image alt='...' src='/image/bridge-to.svg' layout="fill" />
        </div>
        <TokenOnChain tokenIcon="/image/ring.svg" chainIcon="/image/ethereum.png" chainName='Ethereum' />
      </div>
    </Radio.Button>
  )
}

export function BridgeSelector() {
  const [value, setValue] = useState<number>(0);

  return (
    <div className="dark:bg-antDark p-5 w-auto">
      <Radio.Group
        className='w-full overflow-auto'
        style={{ maxHeight: '65vh' }}
        size='large'
        defaultValue={value}
        onChange={(e) => setValue(e.target.value)}
      >
        <Space direction="vertical" className='w-full' size="middle">
          {(new Array(10)).fill(1).map((_, index) => <SelectorItem key={index} value={index} />)}
        </Space>
      </Radio.Group>
    </div>
  );
}
