import { HddOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { DEFAULT_DIRECTION } from 'shared/config/constant';
import { CrossChainDirection } from 'shared/model';
import { getDirectionFromSettings, readStorage, updateStorage } from 'shared/utils/helper';
import { CrossChain } from '../components/CrossChain';
import { DisclaimerModal } from '../components/widget/DisclaimerModal';
import { useITranslation } from '../hooks';
import { AccountProvider, ApiProvider, ClaimProvider, TxProvider, usePersonal, WalletProvider } from '../providers';

const ActiveAccount = dynamic(() => import('../components/widget/account/ActiveAccount'), { ssr: false });
const History = dynamic(() => import('../components/history/History'), { ssr: false });
const BaseModal = dynamic(() => import('../components/widget/BaseModal'), { ssr: false });

function Page() {
  const { t } = useITranslation();
  const [dir, setDir] = useState<CrossChainDirection>(DEFAULT_DIRECTION);
  const [visible, setVisible] = useState(false);
  const { isPersonalHistoryVisible, setIsPersonalHistoryVisible } = usePersonal();

  useEffect(() => {
    const loc = getDirectionFromSettings();
    const hide = readStorage().hideWarning;

    setVisible(!hide);

    setDir(loc);
  }, []);

  return (
    <ApiProvider>
      <WalletProvider>
        <AccountProvider>
          <TxProvider>
            <ClaimProvider>
              <div>
                <div id="app-header-container" className="hidden lg:flex items-center space-x-4 fixed top-4 z-50">
                  <ActiveAccount />

                  <Button icon={<HddOutlined />} onClick={() => setIsPersonalHistoryVisible(true)}>
                    {t('History')}
                  </Button>
                </div>

                <CrossChain dir={dir} />

                <DisclaimerModal
                  visible={visible}
                  onCancel={() => setVisible(false)}
                  onOk={() => {
                    setVisible(false);
                    updateStorage({ hideWarning: true });
                  }}
                />

                <BaseModal
                  title={t('Transfer History')}
                  visible={isPersonalHistoryVisible}
                  onCancel={() => setIsPersonalHistoryVisible(false)}
                  footer={null}
                  maskClosable={false}
                  wrapClassName="history-modal"
                  destroyOnClose
                >
                  <History></History>
                </BaseModal>
              </div>
            </ClaimProvider>
          </TxProvider>
        </AccountProvider>
      </WalletProvider>
    </ApiProvider>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default Page;
