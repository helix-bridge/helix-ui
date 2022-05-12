import { Button, Empty, Radio } from 'antd';
import dynamic from 'next/dynamic';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EllipsisMiddle } from 'shared/components/widget/EllipsisMiddle';
import { IAccountMeta } from 'shared/model';
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

const AccountWithIdentify = ({ value }: { value: IAccountMeta }) => {
  return (
    <>
      <Identicon
        theme="substrate"
        size={iconSize}
        className="mr-2 rounded-full border border-solid border-gray-100"
        value={value.address}
      />
      <span className="flex flex-col leading-5 overflow-hidden">
        <EllipsisMiddle className="opacity-60 w-full">{value.address}</EllipsisMiddle>
      </span>
    </>
  );
};

export const SelectAccountModal: React.FC<Props> = ({ visible, defaultValue, title, footer, onSelect, onCancel }) => {
  const {
    departureConnection: { accounts },
  } = useApi();
  const { t } = useTranslation();

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
      {accounts?.length ? (
        <Radio.Group className="w-full" defaultValue={defaultValue} onChange={(event) => onSelect(event.target.value)}>
          {accounts.map((item) => (
            <Radio.Button
              value={item.address}
              key={item.address}
              className={`radio-list transform transition-all duration-300 hover:scale-105`}
            >
              <AccountWithIdentify value={item} />
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
