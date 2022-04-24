import { Button, Typography, Alert } from 'antd';
import Image from 'next/image';
import { BaseModal } from '../BaseModal';

export const TransferConfirmModal = ({
  visible,
  onCancel,
  onOk,
}: {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}) => (
  <BaseModal
    title="Transfer"
    visible={visible}
    footer={
      <Button className="w-full mx-2 mt-8 mb-4" size="large" type="primary" onClick={onOk}>
        Confirm Transfer
      </Button>
    }
    onCancel={onCancel}
  >
    <div className="flex flex-col">
      <div className="relative">
        <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800">
          <div className="flex items-center space-x-3">
            <Image alt="..." src="/image/ethereum2.svg" width={36} height={36} />
            <div className="flex flex-col">
              <Typography.Text strong>Ethereum</Typography.Text>
              <Typography.Text className="opacity-50">Source Chain</Typography.Text>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Typography.Text strong type="danger">
              -100.234
            </Typography.Text>
            <Typography.Text strong>RING</Typography.Text>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 p-3 bg-gray-900 border border-gray-800">
          <div className="flex items-center space-x-3">
            <Image alt="..." src="/image/darwinia.svg" width={36} height={36} />
            <div className="flex flex-col">
              <Typography.Text strong>Ethereum</Typography.Text>
              <Typography.Text className="opacity-50">Source Chain</Typography.Text>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Typography.Text strong type="success">
              +50.234
            </Typography.Text>
            <Typography.Text strong>RING</Typography.Text>
          </div>
        </div>
        <div className="w-8 h-8 absolute top-0 bottom-0 left-0 right-0 m-auto flex justify-center items-center">
          <Image alt="..." src="/image/transfer-to.svg" width={27} height={27} />
        </div>
      </div>
      <div className="mt-5 mb-3">
        <Typography.Text>Info</Typography.Text>
        <div className="flex flex-col space-y-2 mt-1 p-3 bg-gray-900 border border-gray-800">
          <div className="flex items-center justify-between">
            <Typography.Text className="opacity-60">From</Typography.Text>
            <Typography.Text>0xe59261f6D4088BcD69985A3D369Ff14cC54EF1E5</Typography.Text>
          </div>
          <div className="flex items-center justify-between">
            <Typography.Text className="opacity-60">To</Typography.Text>
            <Typography.Text>2pyqhbWBa9me6GtK43ftepx3JEtovpVHGRZyfYE1CgAaYzZj</Typography.Text>
          </div>
          <div className="flex items-center justify-between">
            <Typography.Text className="opacity-60">Fee</Typography.Text>
            <Typography.Text>50 RING</Typography.Text>
          </div>
        </div>
      </div>
      <Alert
        type="warning"
        message="Please initiate a claim transaction of the Ethereum Network in the Transfer History to receive this token. And it needs to prepare some ETH as the gas fee to claim this token."
        showIcon
      />
    </div>
  </BaseModal>
);
