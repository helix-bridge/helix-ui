import { Button, Empty, Radio } from 'antd';
import dynamic from 'next/dynamic';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PolkadotChainConfig } from 'shared/model';
import { convertToSS58 } from 'shared/utils/helper';
import { useApi } from '../../../providers';
import { BaseModal } from '../BaseModal';

type Props = {
  visible: boolean;
  defaultValue: string;
  title: React.ReactNode;
  footer: React.ReactNode;
  onSelect: (address: string) => void;
  onCancel: () => void;
};

const iconSize = 36;
const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
  ssr: false,
});

export const SelectAccountModal: React.FC<Props> = ({ visible, defaultValue, title, footer, onSelect, onCancel }) => {
  const {
    departureConnection: { accounts },
    departure,
  } = useApi();
  const { t } = useTranslation();
  const data = accounts.map((item) => ({
    ...item,
    address: convertToSS58(item.address, (departure as PolkadotChainConfig).ss58Prefix),
  }));

  return (
    <BaseModal
      title={title}
      destroyOnClose
      visible={visible}
      maskClosable={false}
      onCancel={onCancel}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'scroll',
      }}
      footer={footer}
    >
      {data?.length ? (
        <Radio.Group className="w-full" defaultValue={defaultValue} onChange={(event) => onSelect(event.target.value)}>
          {data.map((item) => (
            <Radio.Button
              value={item.address}
              key={item.address}
              className={`radio-list transform transition-all duration-300 hover:scale-105`}
            >
              <>
                <Identicon
                  theme="substrate"
                  size={iconSize}
                  className="mr-2 rounded-full border border-solid border-gray-100"
                  value={item.address}
                />
                <div className="flex flex-col">
                  <span>{item.meta?.name}</span>

                  <span className="truncate w-11/12">{item.address}</span>
                </div>
              </>
            </Radio.Button>
          ))}
        </Radio.Group>
      ) : (
        <Empty
          image="/image/empty.png"
          imageStyle={{ height: 44 }}
          description={t('You haven’t created an address yet, please create a address first.')}
          className="flex justify-center flex-col items-center"
        >
          <Button
            onClick={() => {
              const url = 'https://polkadot.js.org';

              window.open(url, 'blank');
            }}
          >
            {t('How to create?')}
          </Button>
        </Empty>
      )}
    </BaseModal>
  );
};
