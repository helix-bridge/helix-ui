import { Modal, ModalProps } from 'antd';
import { PropsWithChildren, memo } from 'react';
import classNames from 'classnames/bind';
import styles from './BaseModal.module.scss';
import Image from 'next/image';

const cx = classNames.bind(styles);

const Component = ({ children, ...others }: PropsWithChildren<ModalProps>) => (
  <Modal
    {...others}
    className={cx('main')}
    closeIcon={<Image alt="..." src="/image/modal-close.svg" width={16} height={16} />}
  >
    {children}
  </Modal>
);

export const BaseModal = memo(Component);
