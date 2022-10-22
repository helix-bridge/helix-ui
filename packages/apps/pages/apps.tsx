import { HddOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { readStorage, updateStorage } from 'shared/utils/helper/storage';
import { BridgeState } from '../components/bridge/BridgeState';
import { CrossChain } from '../components/CrossChain';
import { DisclaimerModal } from '../components/widget/DisclaimerModal';
import { Path } from '../config';
import { useITranslation } from '../hooks';
import {
  AccountProvider,
  ApiProvider,
  ClaimProvider,
  TxProvider,
  useAccount,
  usePersonal,
  WalletProvider,
} from '../providers';

const ActiveAccount = dynamic(() => import('../components/widget/account/ActiveAccount'), { ssr: false });
const History = dynamic(() => import('../components/history/History'), { ssr: false });
const BaseModal = dynamic(() => import('../components/widget/BaseModal'), { ssr: false });

function HistoryBtn() {
  const { t } = useITranslation();
  const router = useRouter();
  const { account } = useAccount();

  return account ? (
    <Button
      icon={<HddOutlined />}
      onClick={() =>
        router.push({
          pathname: Path.transaction,
          query: new URLSearchParams({
            account,
          }).toString(),
        })
      }
    >
      {t('History')}
    </Button>
  ) : null;
}

function Page() {
  const { t } = useITranslation();

  const [visible, setVisible] = useState(false);
  const { isPersonalHistoryVisible, setIsPersonalHistoryVisible } = usePersonal();

  useEffect(() => {
    const hide = readStorage().hideWarning;

    setVisible(!hide);
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

                  <HistoryBtn />
                </div>

                <BridgeState className="w-full lg:w-1/2 mx-auto mb-2" />

                <CrossChain />

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
                  open={isPersonalHistoryVisible}
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
