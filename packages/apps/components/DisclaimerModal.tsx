import {memo} from 'react';
import { BaseModal } from './BaseModal';
import { Typography, Button } from 'antd';

const Component = ({ visible, onCancel, onOk }: { visible: boolean; onCancel: () => void; onOk: () => void }) => (
  <BaseModal
  visible={visible}
  title={<span>Disclaimer</span>}
  footer={<Button type='primary' className='mb-8' onClick={onOk}>Agree and Continue</Button>}
  onCancel={onCancel}
>
  <div className='flex flex-col px-3'>
    <Typography.Paragraph>By using Helix, I agree to the following:</Typography.Paragraph>
    <Typography.Paragraph>I understand that Helix is a bridge aggregator and is only responsible for routing the transfer to the selected bridge. Helix does not hold any funds in custody at any point.</Typography.Paragraph>
    <Typography.Paragraph>I understand that the fees shown in a route are estimations and may vary.</Typography.Paragraph>
    <Typography.Paragraph>I understand that the bridging time shown in a route is an estimation. Helix has no control over the bridging time. The bridge or protocol being used may sometimes take more time than the estimated time.</Typography.Paragraph>
    <Typography.Paragraph>I understand that the app is in Beta and all risks associated with using it.</Typography.Paragraph>
    <Typography.Paragraph>I am lawfully permitted to access this site and use Helix under the laws of the jurisdiction in which I reside and am located.</Typography.Paragraph>
  </div>
</BaseModal>
)

export const DisclaimerModal = memo(Component);
