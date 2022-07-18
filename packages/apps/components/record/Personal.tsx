import { ClockCircleOutlined, LoadingOutlined, PaperClipOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Pagination, Result, Spin, Tabs, Tooltip } from 'antd';
import { format } from 'date-fns';
import request from 'graphql-request';
import { useCallback, useEffect, useState } from 'react';
import { from, map } from 'rxjs';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { CrossChainStatus, DATE_TIME_FORMAT } from 'shared/config/constant';
import { ENDPOINT } from 'shared/config/env';
import { HelixHistoryRecord } from 'shared/model';
import { convertToDvm, gqlName, isValidAddress } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import {
  getReceiveAmountFromHelixRecord,
  getSendAmountFromHelixRecord,
  getTokenNameFromHelixRecord,
} from 'shared/utils/record';
import { HISTORY_RECORDS } from '../../config/gql';
import { useITranslation } from '../../hooks';
import { Paginator } from '../../model';
import { useAccount, useApi } from '../../providers';
import { BridgeArrow } from '../bridge/BridgeArrow';
import { TokenOnChain } from '../widget/TokenOnChain';

// eslint-disable-next-line complexity
export function Personal() {
  const { t } = useITranslation();
  const [result, setResult] = useState<number | null>(null);
  const { account } = useAccount();
  const { connectDepartureNetwork, departure, isConnecting } = useApi();
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState<HelixHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginator, setPaginator] = useState<Paginator>({ row: 10, page: 0 });

  const fetchData = useCallback(() => {
    if (!account) {
      return;
    }

    const sender = isValidAddress(account, 'ethereum') ? account : convertToDvm(account);
    const args = {
      ...paginator,
      sender,
      result: result === null ? undefined : result,
    };

    setLoading(true);

    return from(request(ENDPOINT, HISTORY_RECORDS, args))
      .pipe(map((res) => res && res[gqlName(HISTORY_RECORDS)]))
      .subscribe({
        next(response) {
          setTotal(response.total);
          setSource(response.records);
        },
        complete() {
          setLoading(false);
        },
      });
  }, [account, paginator, result]);

  useEffect(() => {
    const sub$$ = fetchData();

    return () => sub$$?.unsubscribe();
  }, [fetchData]);

  return !account ? (
    <Result
      status="warning"
      title={t('You must connect the wallet to fetch the records')}
      extra={
        <Button
          onClick={() => {
            connectDepartureNetwork(departure);
          }}
          disabled={isConnecting}
          icon={isConnecting ? <LoadingOutlined /> : undefined}
        >
          {t('Connect to Wallet')}
        </Button>
      }
    />
  ) : (
    <Tabs
      defaultActiveKey="-1"
      onTabClick={(key) => {
        const res = Number(key) - 1;

        setResult(res < 0 ? null : res);
      }}
      tabBarExtraContent={{
        right: (
          <ReloadOutlined
            onClick={() => {
              setTotal(0);
              setSource([]);
              fetchData();
            }}
          />
        ),
      }}
    >
      {['All', 'Pending', 'Success', 'Refund'].map((label, index) => (
        <Tabs.TabPane
          tab={
            label === 'Refund' ? (
              <div className="flex items-center gap-2">
                <span>{t(label)}</span>
                <span className="rounded-full bg-blue-400 text-xs p-0.5 text-white">10</span>
              </div>
            ) : (
              t(label)
            )
          }
          key={index}
        >
          {loading ? (
            <Spin spinning className="mt-12 mx-auto w-full" />
          ) : (
            <div>
              {source.map((record) => {
                const { fromChain, toChain, bridge } = record;
                const dep = getChainConfig(fromChain);
                const arrival = getChainConfig(toChain);
                const symbol = getTokenNameFromHelixRecord(record);
                const fromToken = dep.tokens.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase())!;
                const overview = fromToken.cross.find(
                  (item) => item.category === bridge && item.partner.name === toChain
                );
                const toToken = arrival.tokens.find(
                  (item) => item.symbol.toLowerCase() === overview?.partner.symbol.toLowerCase()
                )!;

                return (
                  <div className="flex justify-between items-center " key={record.id}>
                    <div className="flex-1 grid grid-cols-3 self-stretch pr-8 p-4 border border-gray-800 mb-4 bg-gray-900 rounded-xs">
                      <TokenOnChain
                        token={{ ...fromToken, meta: dep, amount: getSendAmountFromHelixRecord(record) }}
                        isFrom
                        asHistory
                      >
                        <SubscanLink network={dep} txHash={record.requestTxHash}>
                          <PaperClipOutlined className="hover:text-pangolin-main cursor-pointer" />
                        </SubscanLink>
                      </TokenOnChain>

                      <BridgeArrow category={record.bridge} showName={false} />

                      <TokenOnChain
                        token={{ ...toToken, meta: arrival, amount: getReceiveAmountFromHelixRecord(record) }}
                        asHistory
                        className="justify-end"
                      >
                        {result !== CrossChainStatus.pending ? (
                          <SubscanLink network={arrival} txHash={record.targetTxHash!}>
                            <PaperClipOutlined className="hover:text-pangolin-main cursor-pointer" />
                          </SubscanLink>
                        ) : (
                          <Tooltip
                            title={t('When the transaction is successful, the extrinsic message will be provided')}
                          >
                            <PaperClipOutlined className="cursor-pointer" />
                          </Tooltip>
                        )}
                      </TokenOnChain>
                    </div>

                    <div className="text-right w-1/5 px-4 py-3  border border-gray-800 mb-4 bg-gray-900 rounded-xs">
                      <div className="mb-2">{format(record.startTime * 1000, DATE_TIME_FORMAT)}</div>

                      {record.result === CrossChainStatus.pending && (
                        <div className="flex items-center gap-2">
                          <ClockCircleOutlined />
                          <span>{t('Pending')}</span>
                        </div>
                      )}

                      {record.result === CrossChainStatus.success && (
                        <div className="text-green-400">{t('Success')}</div>
                      )}

                      {record.result === CrossChainStatus.reverted && (
                        <Button type="primary" size="small">
                          {t('Refund')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end items-center">
                {!!total && (
                  <Pagination
                    onChange={(page: number, pageSize: number) => {
                      setPaginator({ row: pageSize, page: page - 1 });
                    }}
                    current={paginator.page + 1}
                    pageSize={paginator.row}
                    total={total ?? 0}
                    showTotal={() => t('Total {{total}}', { total })}
                  />
                )}
              </div>
            </div>
          )}
        </Tabs.TabPane>
      ))}
    </Tabs>
  );
}
