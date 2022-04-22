import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { TransferInput } from '../components/TransferInput';
import { BridgeSelector } from '../components/BridgeSelector';
import { Row, Col } from 'antd';

function Page() {
  const { t } = useTranslation();
  void t;

  return (
    <>
      <Row>
        <Col xs={24} sm={8}>
          <TransferInput />
        </Col>
        <Col xs={24} sm={{ span: 15, offset: 1 }}>
          <BridgeSelector />
        </Col>
      </Row>
    </>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default Page;
