import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Row, Col } from 'antd';
import { TransferInput } from '../components/TransferInput';
import { BridgeSelector } from '../components/BridgeSelector';

function Page() {
  const { t } = useTranslation();
  void t;

  return (
    <>
      <Row>
        <Col span={8}>
          <TransferInput />
        </Col>
        <Col span={15} offset={1}>
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
