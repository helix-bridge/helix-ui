import { Modal, ModalProps } from 'antd';
import { PropsWithChildren } from 'react';
import { Icon } from 'shared/components/widget/Icon';

export const BaseModal = ({ children, wrapClassName = 'helix-modal', ...others }: PropsWithChildren<ModalProps>) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <Modal {...others} wrapClassName={wrapClassName} closeIcon={<Icon name="close" />}>
    {children}
  </Modal>
);
