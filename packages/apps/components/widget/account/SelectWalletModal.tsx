import { Radio } from 'antd';
import React, { useEffect, useState } from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { SupportedWallet } from 'shared/model';
import { isPolkadotExtensionInstalled } from 'shared/utils/connection';
import BaseModal from '../BaseModal';

type Props = {
  visible: boolean;
  defaultValue: string;
  title: React.ReactNode;
  footer: React.ReactNode;
  onSelect: (address: SupportedWallet, mathWalletMode: 'ethereum' | 'polkadot' | '') => void;
  onCancel: () => void;
};

export const wallets: { logo: string; name: SupportedWallet }[] = [
  { name: 'metamask', logo: 'metamask.svg' },
  { name: 'polkadot', logo: 'polkadot.svg' },
  { name: 'subwallet', logo: 'subwallet.svg' },
  { name: 'talisman', logo: 'talisman.svg' },
  { name: 'mathwallet', logo: 'mathwallet.png' },
];

export const SelectWalletModal: React.FC<Props> = ({ visible, defaultValue, title, footer, onSelect, onCancel }) => {
  const [mathwalletMode, setMathwalletMode] = useState<'ethereum' | 'polkadot' | ''>('');
  useEffect(() => {
    (async () => {
      if (window.ethereum.isMathWallet) {
        setMathwalletMode('ethereum');
        return;
      }

      const inPolkadotMode = await isPolkadotExtensionInstalled('mathwallet');

      if (inPolkadotMode) {
        setMathwalletMode('polkadot');
        return;
      }
      setMathwalletMode('');
    })();
  }, []);

  return (
    <BaseModal
      title={title}
      destroyOnClose
      open={visible}
      maskClosable={false}
      onCancel={onCancel}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'scroll',
      }}
      footer={footer}
    >
      <Radio.Group
        className="w-full"
        defaultValue={defaultValue}
        onChange={(event) => onSelect(event.target.value, mathwalletMode)}
      >
        {wallets.map((item) => (
          <Radio.Button
            value={item.name}
            key={item.name}
            className="radio-list transition-all duration-300 hover:scale-105 relative"
          >
            <Logo name={item.logo} width={36} height={36} />
            <span className="ml-4 capitalize">{item.name}</span>
            {item.name === 'mathwallet' && (
              <span className="capitalize text-xs absolute right-2 top-2">{mathwalletMode} mode</span>
            )}
          </Radio.Button>
        ))}
      </Radio.Group>
    </BaseModal>
  );
};
