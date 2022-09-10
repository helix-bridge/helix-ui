import { Modal, ModalProps } from 'antd';
import { PropsWithChildren } from 'react';
import { Icon } from 'shared/components/widget/Icon';

const BaseModal = ({ children, wrapClassName, ...others }: PropsWithChildren<ModalProps>) => (
  <Modal {...others} wrapClassName={`${wrapClassName} helix-modal`} closeIcon={<Icon name="close" />}>
    {children}
  </Modal>
);

export default BaseModal;
