import { Card, Divider, Form, Input } from 'antd';
import { Contract } from 'ethers';
import { i18n, Trans, useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { initReactI18next } from 'react-i18next';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { of } from 'rxjs/internal/observable/of';
import { filter } from 'rxjs/internal/operators/filter';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { ethereumConfig } from 'shared/config/network';
import { validateMessages } from 'shared/config/validate-msg';
import { Tx } from 'shared/model';
import { entrance, getMetamaskConnection, metamaskGuard } from 'shared/utils/connection';
import { fromWei } from 'shared/utils/helper/balance';
import { applyModalObs, genEthereumContractTxObs } from 'shared/utils/tx';
import abi from '../../config/ethv1/abi.json';
import claimSource from '../../config/ethv1/airdrop2.json';
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

// eslint-disable-next-line complexity
export function Claim() {
  const { t } = useTranslation();
  const [claimItem, setClaimItem] = useState<ClaimItem>();
  const [account, setAccount] = useState<string>();
  const [claimed, setClaimed] = useState<boolean>(true);
  const { setDeparture } = useApi();
  const { observer } = useTx();
  const [checking, setChecking] = useState(false);

  const { ring, kton } = useMemo(
    () => ({
      ring: fromWei({ value: claimItem?.erc20.amounts[0] || 0 }),
      kton: fromWei({ value: claimItem?.erc20.amounts[1] || 0 }),
    }),
    [claimItem]
  );

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

    setChecking(true);
    (contract.claimed(to, merkleRoot) as Promise<boolean>)
      .then((res: boolean) => setClaimed(res))
      .finally(() => setChecking(false));
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
              <div className="text-center text-2xl bg-gray-900 border-solid border border-gray-700 py-4">
                {ring} RING & {kton} KTON
              </div>

              <div className="text-xs text-center mt-4">
                {!!account && !checking && (!claimItem || claimed)
                  ? t('The token had been claimed or there is no token to claim for this account')
                  : t('The tokens will be claimed to the account you entered above. ')}
              </div>
            </div>
          </Form.Item>
        )}

        <FormItemButton
          disabled={!account || !claimItem || claimed}
          onClick={() => {
            const { proof, to, erc20, erc1155, erc721, salt } = claimItem!;

            metamaskGuard<Tx>(() =>
              getMetamaskConnection().pipe(
                filter((connection) => !!connection && !!connection.accounts[0]),
                switchMap((connection) => {
                  const activeAccount = connection.accounts[0].address;

                  if (activeAccount.toLowerCase() !== to.toLocaleLowerCase()) {
                    return applyModalObs({
                      title: <h3 className="text-center">{t('Confirm To Continue')}</h3>,
                      content: (
                        <Trans
                          i18nKey="claimToolD2EConfirm"
                          i18n={i18n?.use(initReactI18next)}
                          tOptions={{
                            txAccount: activeAccount,
                            to,
                          }}
                        >
                          The active account in metamask is inconsistent with the receiving account. Do you want to use
                          <p className="font-bold mb-0">{activeAccount}</p>
                          <p className="font-bold mb-0">{to}</p>
                        </Trans>
                      ),
                      cancelButtonProps: { size: 'large', className: 'w-1/2' },
                      okButtonProps: { size: 'large', className: 'w-1/2' },
                    });
                  } else {
                    return of(true);
                  }
                }),
                switchMap((confirmed) =>
                  confirmed
                    ? genEthereumContractTxObs(
                        contractAddress,
                        (contract) =>
                          contract.claimMultipleTokens(
                            merkleRoot,
                            [to, erc1155, erc721, [erc20.amounts, erc20.contractAddresses], salt],
                            proof
                          ),
                        abi
                      )
                    : EMPTY
                )
              )
            )(ethereumConfig).subscribe(observer);
          }}
        >
          {t('Claim')}
        </FormItemButton>
      </Form>
    </Card>
  );
}
