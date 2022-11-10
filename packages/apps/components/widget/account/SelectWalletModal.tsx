import { Radio } from 'antd';
import React from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { SupportedWallet } from 'shared/model';
import BaseModal from '../BaseModal';

type Props = {
  visible: boolean;
  defaultValue: string;
  title: React.ReactNode;
  footer: React.ReactNode;
  onSelect: (address: SupportedWallet) => void;
  onCancel: () => void;
};

const wallets: { logo: string; name: SupportedWallet }[] = [
  { name: 'metamask', logo: 'metamask.svg' },
  { name: 'polkadot', logo: 'polkadot.svg' },
  { name: 'subwallet', logo: 'subwallet.svg' },
  { name: 'talisman', logo: 'talisman.svg' },
];

export const SelectWalletModal: React.FC<Props> = ({ visible, defaultValue, title, footer, onSelect, onCancel }) => {
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
      <Radio.Group className="w-full" defaultValue={defaultValue} onChange={(event) => onSelect(event.target.value)}>
        {wallets.map((item) => (
          <Radio.Button
            value={item.name}
            key={item.name}
            className={`radio-list 'transition-all duration-300 hover:scale-105'`}
          >
            <Logo name={item.logo} width={36} height={36} />
            <span className="ml-4 capitalize">{item.name}</span>
          </Radio.Button>
        ))}
      </Radio.Group>
    </BaseModal>
  );
};
