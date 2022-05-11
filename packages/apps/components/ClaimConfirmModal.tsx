import { Typography, Button } from 'antd';
import { memo } from 'react';
import { BaseModal } from './widget/BaseModal';

const Component = ({ visible, onCancel, onOk }: { visible: boolean; onCancel: () => void; onOk: () => void }) => (
  <BaseModal
    title="Claim"
    visible={visible}
    footer={
      <Button size="large" type="primary" onClick={onOk} className="w-full mb-4 mx-2">
        Continue to claim
      </Button>
    }
    onCancel={onCancel}
  >
    <div>
      <Typography.Paragraph className="text-center">
        You need to confirm one more transaction to get your funds in your Etherum address. In case of any issue, please
        reach out to{' '}
        <Typography.Link target="_bank" rel="noopener noreferrer" href="mailto:hello@helixbridge.app">
          hello@helixbridge.app
        </Typography.Link>
      </Typography.Paragraph>
      <div className="flex justify-center items-center p-8 bg-gray-900 border border-gray-800 space-x-2">
        <Typography.Text>Estimated Gas Fee:</Typography.Text>
        <Typography.Text strong>0.12 ETH</Typography.Text>
      </div>
    </div>
  </BaseModal>
);

export const ClaimConfirmModal = memo(Component);
