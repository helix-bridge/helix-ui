import { Modal, ModalProps } from 'antd';
import { PropsWithChildren } from 'react';
import { Icon } from '@helix/shared/components/widget/Icon';

export const BaseModal = ({ children, wrapClassName = 'helix-modal', ...others }: PropsWithChildren<ModalProps>) => (
  <Modal {...others} wrapClassName={wrapClassName} closeIcon={<Icon name="close" />}>
    {children}
  </Modal>
);
