import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { TransferInput } from '../components/TransferInput';
import { BridgeSelector } from '../components/BridgeSelector';
import { DisclaimerModal } from '../components/DisclaimerModal';
import { Row, Col } from 'antd';
import { useState } from 'react';

function Page() {
  const [visible, setVisible] = useState(true);
  const { t } = useTranslation();
  void t;

  return (
    <>
      <Row>
        <Col xs={24} sm={8}>
          <TransferInput />
        </Col>
        <Col xs={24} sm={0} className='h-5'></Col>
        <Col xs={24} sm={{ span: 15, offset: 1 }}>
          <BridgeSelector />
        </Col>
      </Row>
      <DisclaimerModal visible={visible} onCancel={() => setVisible(false)} onOk={() => setVisible(false)} />
    </>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default Page;
