import { memo } from 'react';
import { Button } from 'antd';
import BaseModal from './BaseModal';

const Component = ({ visible, onCancel, onOk }: { visible: boolean; onCancel: () => void; onOk: () => void }) => (
  <BaseModal
    open={visible}
    title={<span>Disclaimer</span>}
    footer={
      <Button type="primary" className="mb-8" onClick={onOk}>
        Agree and Continue
      </Button>
    }
    onCancel={onCancel}
  >
    <div className="flex flex-col px-3">
      <p>By using Helix, I agree to the following:</p>
      <p>
        I understand that Helix is a bridge aggregator and is only responsible for routing the transfer to the selected
        bridge. Helix does not hold any funds in custody at any point.
      </p>
      <p>I understand that the fees shown in a route are estimations and may vary.</p>
      <p>
        I understand that the bridging time shown in a route is an estimation. Helix has no control over the bridging
        time. The bridge or protocol being used may sometimes take more time than the estimated time.
      </p>
      <p>I understand that the app is in Beta and all risks associated with using it.</p>
      <p>
        I am lawfully permitted to access this site and use Helix under the laws of the jurisdiction in which I reside
        and am located.
      </p>
    </div>
  </BaseModal>
);

export const DisclaimerModal = memo(Component);
