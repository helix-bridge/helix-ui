import { Radio } from 'antd';
import React from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { SupportedWallet } from 'shared/model';
import { extractWalletInfo } from 'shared/utils/connection';
import BaseModal from '../BaseModal';

type Props = {
  visible: boolean;
  defaultValue: string;
  title: React.ReactNode;
  footer: React.ReactNode;
  onSelect: (address: SupportedWallet) => void;
  onCancel: () => void;
};

export const walletConfigs: { logo: string; name: SupportedWallet }[] = [
  { name: 'metamask', logo: 'metamask.svg' },
  { name: 'polkadot', logo: 'polkadot.svg' },
  { name: 'subwallet', logo: 'subwallet.svg' },
  { name: 'talisman', logo: 'talisman.svg' },
  { name: 'mathwallet-ethereum', logo: 'mathwallet.png' },
  { name: 'mathwallet-polkadot', logo: 'mathwallet.png' },
];

export const WalletList: React.FC<Pick<Props, 'defaultValue' | 'onSelect'> & { wallets?: SupportedWallet[] }> = ({
  defaultValue,
  onSelect,
  wallets,
}) => {
  return (
    <Radio.Group className="w-full" defaultValue={defaultValue} onChange={(event) => onSelect(event.target.value)}>
      {walletConfigs
        .filter((item) => !wallets || wallets.includes(item.name))
        .map((item) => {
          const [plugin, mode] = extractWalletInfo(item.name);

          return (
            <Radio.Button
              value={item.name}
              key={item.name}
              className="radio-list transition-all duration-300 hover:scale-105 relative"
            >
              <Logo name={item.logo} width={36} height={36} />
              <span className="ml-4 capitalize">{plugin}</span>
              {item.name.includes('mathwallet') && (
                <span className="capitalize text-xs absolute right-2 top-2">{mode} mode</span>
              )}
            </Radio.Button>
          );
        })}
    </Radio.Group>
  );
};

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
      <WalletList defaultValue={defaultValue} onSelect={onSelect}></WalletList>
    </BaseModal>
  );
};
