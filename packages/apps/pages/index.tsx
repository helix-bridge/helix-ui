import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Row, Col } from 'antd';
import { Transfer } from '../components/transfer/Transfer';
import { BridgeSelector } from '../components/BridgeSelector';

function Page() {
  // const [visible, setVisible] = useState(true);
  const { t } = useTranslation();
  void t;

  return (
    <>
      <Row>
        <Col xs={24} sm={8} className="mb-4 sm:mb-0">
          <Transfer />
        </Col>

        <Col xs={24} sm={{ span: 15, offset: 1 }}>
          <BridgeSelector />
        </Col>
      </Row>
      {/* <DisclaimerModal visible={visible} onCancel={() => setVisible(false)} onOk={() => setVisible(false)} /> */}
    </>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default Page;
