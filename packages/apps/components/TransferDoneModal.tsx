import {memo} from 'react';
import { BaseModal } from './BaseModal';
import { Typography, Button } from 'antd';
import Image from 'next/image';
import Link from 'next/link';

const Component = ({ visible, onCancel, onOk }: { visible: boolean; onCancel: () => void; onOk: () => void }) => (
  <BaseModal
  title='Transfer'
  visible={visible}
  footer={<Button className='w-full' type='primary' size='large' onClick={onOk}>Done</Button>}
  onCancel={onCancel}
  >
  <div className='flex flex-col items-center px-9 py-20 space-y-6'>
    <Image alt='...' src='/image/transfer-done.svg' width={133} height={110} />
    <Typography.Paragraph>Transfer Submitted</Typography.Paragraph>
    <Typography.Text className='text-center'>The transaction has been sent, please check the transfer progress in the <Link href='/history'>history</Link>.</Typography.Text>
  </div>
  </BaseModal>
)

export const TransferDoneModal = memo(Component);
