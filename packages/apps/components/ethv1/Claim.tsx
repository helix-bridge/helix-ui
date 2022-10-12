import { Button, Card, Divider, Form, Input, message } from 'antd';
import { Contract } from 'ethers';
import { i18n, Trans } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { initReactI18next } from 'react-i18next';
import { ethereumConfig } from 'shared/config/network';
import { validateMessages } from 'shared/config/validate-msg';
import { Tx } from 'shared/model';
import { entrance, metamaskGuard } from 'shared/utils/connection';
import { fromWei } from 'shared/utils/helper/balance';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { Path } from '../../config';
import abi from '../../config/ethv1/abi.json';
import claimSource from '../../config/ethv1/airdrop2.json';
import { useITranslation } from '../../hooks';
import { useApi, useTx } from '../../providers';
import { isValidAddressStrict } from '../../utils/validate';
import { FormItemButton } from '../widget/FormItemButton';

interface ClaimItem {
  erc20: Erc20;
  to: string;
  salt: string;
  proof: string[];
  erc1155: unknown[];
  erc721: unknown[];
}

interface Erc20 {
  amounts: string[];
  contractAddresses: string[];
}

const contractAddress = '0x15fC591601044351868b13a5B629c170Bf3F30A0';
const merkleRoot = '0x025883e9abdfb630703ed746142146ab9cb2569b24bd72475566bae6c2f0a30a';

export function Claim() {
  const { t } = useITranslation();
  const [claimItem, setClaimItem] = useState<ClaimItem>();
  const [account, setAccount] = useState<string>();
  const [claimed, setClaimed] = useState<boolean>(true);
  const router = useRouter();
  const { setDeparture } = useApi();
  const { observer } = useTx();

  useEffect(() => {
    setDeparture(ethereumConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!claimItem) {
      setClaimed(true);
      return;
    }

    const { to } = claimItem;
    const contract = new Contract(contractAddress, abi, entrance.web3.getInstance(ethereumConfig.provider));

    contract.claimed(to, merkleRoot).then((res: boolean) => setClaimed(res));
  }, [claimItem]);
  return (
    <Card className="w-full lg:w-1/2 xl:w-1/3 mx-auto rounded border-none">
      <h3 className="text-center">{t('Claim Tool')}</h3>
      <Trans i18nKey="claimToolD2ETips" i18n={i18n?.use(initReactI18next)}>
        With the Darwinia Smart Chain - Ethereum V2 bridge launching, the Darwinia Chain - Ethereum V1 is taken down. We
        no longer support the transfer records of Darwinia Chain - Ethereum V1. Since you may have some unclaimed tokens
        on Ethereum, we offer this tool for you to check and claim the tokens.
        <a href="mailto:hello@helixbridge.app" target="_blank" rel="noreferrer">
          {' '}
          Contact us{' '}
        </a>{' '}
        if you have some further questions.
      </Trans>

      <Divider />

      <Form layout="vertical" validateMessages={validateMessages[i18n?.language as 'en' | 'zh-CN' | 'zh']}>
        <Form.Item
          label={t('Receiving Account')}
          name="account"
          validateFirst
          className="mb-4"
          rules={[
            { required: true },
            {
              validator(_, value: string) {
                return isValidAddressStrict(value, 'ethereum') ? Promise.resolve() : Promise.reject();
              },
              message: t(
                'Enter an account address to check and claim for it. The account address should be starting with 0x.'
              ),
            },
          ]}
        >
          <Input
            size="large"
            onChange={(event) => {
              const acc = event.target.value;

              if (!isValidAddressStrict(acc, 'ethereum')) {
                setAccount(undefined);
                return;
              }

              const target = claimSource.find((item) => item.to.toLowerCase() === acc.toLowerCase());

              setAccount(acc);
              setClaimItem(target);
            }}
          />
        </Form.Item>

        {!!account && (
          <Form.Item>
            <div>
              <div className="text-center text-lg bg-gray-900 border-solid border border-gray-700 py-4">
                <Trans i18nKey="claimToolD2EInfo">
                  In this account, there are{' '}
                  <div className="text-2xl">
                    <span className="truncate">{fromWei({ value: claimItem?.erc20.amounts[0] || 0 })}</span> RING &{' '}
                    <span className="truncate">{fromWei({ value: claimItem?.erc20.amounts[1] || 0 })}</span> KTON{' '}
                  </div>{' '}
                  unclaimed on Ethereum.
                </Trans>
              </div>

              <div className="text-xs text-center mt-4">
                {t('The tokens will be claimed to the account you entered above. ')}
              </div>
            </div>
          </Form.Item>
        )}

        <FormItemButton
          onClick={() => {
            if (!account || !claimItem) {
              return;
            }

            if (claimed) {
              message.error(t('Already claimed, unable to claim repeat'));
              return;
            }

            const { proof, to, erc20, erc1155, erc721, salt } = claimItem;

            metamaskGuard<Tx>(() =>
              genEthereumContractTxObs(
                contractAddress,
                (contract) =>
                  contract.claimMultipleTokens(
                    merkleRoot,
                    [to, erc1155, erc721, [erc20.amounts, erc20.contractAddresses], salt],
                    proof
                  ),
                abi
              )
            )(ethereumConfig).subscribe(observer);
          }}
        >
          {t('Claim')}
        </FormItemButton>
      </Form>

      <Button size="large" onClick={() => router.push(Path.apps)} className="w-full">
        {t('Back')}
      </Button>
    </Card>
  );
}
