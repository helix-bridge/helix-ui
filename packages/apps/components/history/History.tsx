import { LoadingOutlined, PaperClipOutlined, ReloadOutlined } from '@ant-design/icons';
import { Badge, Button, Empty, message, Pagination, Result, Spin, Tabs, Tooltip } from 'antd';
import { format } from 'date-fns';
import { useManualQuery } from 'graphql-hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { from } from 'rxjs/internal/observable/from';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';
import { ExplorerLink } from 'shared/components/widget/ExplorerLink';
import { DATE_TIME_FORMAT, RecordStatus } from 'shared/config/constant';
import { HelixHistoryRecord } from 'shared/model';
import { convertToDvm } from 'shared/utils/helper/address';
import { gqlName } from 'shared/utils/helper/common';
import { isValidAddress } from 'shared/utils/helper/validator';
import { getDetailPaths } from 'utils/record/path';
import { HISTORY_RECORDS_IN_RESULTS, STATUS_STATISTICS } from '../../config/gql';
import { useITranslation } from '../../hooks';
import { Paginator } from '../../model';
import { useAccount, useApi } from '../../providers';
import { useClaim } from '../../providers/claim';
import { isEthereumDarwinia } from '../../utils';
import { getOriginChainConfig } from '../../utils/network';
import {
  getReceivedAmountFromHelixRecord,
  getSentAmountFromHelixRecord,
  getTokenConfigFromHelixRecord,
} from '../../utils/record/record';
import { BridgeArrow } from '../bridge/BridgeArrow';
import { TokenOnChain } from '../widget/TokenOnChain';
import { Pending } from './Pending';
import { PendingToClaim } from './PendingToClaim';
import { PendingToRefund } from './PendingToRefund';
import { Refunded } from './Refunded';

const paginatorDefault: Paginator = { row: 4, page: 0 };

export default function History() {
  const { t } = useITranslation();
  const [activeTab, setActiveTab] = useState<number>(-1);
  const { account } = useAccount();
  const { connectDepartureNetwork, departure, isConnecting } = useApi();
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState<HelixHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginator, setPaginator] = useState<Paginator>(paginatorDefault);
  const { refundedList } = useClaim();
  const [goOnAmount, setGoOnAmount] = useState(0);

  const records = useMemo<HelixHistoryRecord[]>(() => {
    return source.map((record) => {
      if (refundedList.find((item) => item.id === record.id)) {
        record.result = RecordStatus.pendingToConfirmRefund;
      }

      return record;
    });
  }, [refundedList, source]);

  const results = useMemo(() => {
    if (+activeTab < 0) {
      return null;
    } else if (+activeTab === 0) {
      return [RecordStatus.pending, RecordStatus.pendingToClaim, RecordStatus.pendingToRefund];
    } else if (+activeTab === 1) {
      return [RecordStatus.success];
    } else {
      return [RecordStatus.refunded];
    }
  }, [activeTab]);

  const [requestHistoryRecords] = useManualQuery(HISTORY_RECORDS_IN_RESULTS);
  const [requestStatisticRecords] = useManualQuery(STATUS_STATISTICS);

  const fetchData = useCallback(() => {
    const sender = isValidAddress(account, 'ethereum') ? account : convertToDvm(account);
    const variables = {
      ...paginator,
      sender: sender.toLowerCase(),
      results: results === null ? undefined : results,
    };

    setLoading(true);

    return from(requestHistoryRecords({ variables }))
      .pipe(
        map(({ data, error }) => {
          if (data) {
            return data[gqlName(HISTORY_RECORDS_IN_RESULTS)];
          } else if (error) {
            throw new Error('Request failed!');
          }

          return null;
        }),
        filter((res) => res)
      )
      .subscribe({
        next(response) {
          setTotal(response.total);
          setSource(response.records);
        },
        error(error) {
          message.error(error.message);
        },
        complete() {
          setLoading(false);
        },
      });
  }, [account, paginator, requestHistoryRecords, results]);

  const fetchGoOnAmount = useCallback(
    (address: string) => {
      return from(
        requestStatisticRecords({
          variables: {
            results: [RecordStatus.pendingToClaim, RecordStatus.pendingToRefund],
            sender: isValidAddress(address, 'ethereum') ? address : convertToDvm(address),
          },
        })
      )
        .pipe(map(({ data }) => data && data[gqlName(STATUS_STATISTICS)]))
        .subscribe((res) => {
          setGoOnAmount(res.total);
        });
    },
    [requestStatisticRecords]
  );

  useEffect(() => {
    const sub$$ = fetchGoOnAmount(account);

    return () => sub$$.unsubscribe();
  }, [account, fetchGoOnAmount]);

  useEffect(() => {
    if (!account) {
      setSource([]);
      return;
    }

    const sub$$ = fetchData();

    return () => sub$$?.unsubscribe();
  }, [account, fetchData]);

  if (!account) {
    return (
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
    );
  }

  return (
    <Tabs
      defaultActiveKey="-1"
      onTabClick={(key) => {
        const res = Number(key) - 1;

        setActiveTab(res);

        setPaginator(paginatorDefault);
      }}
      tabBarExtraContent={{
        right: (
          <ReloadOutlined
            onClick={() => {
              setTotal(0);
              setSource([]);
              fetchData();
              fetchGoOnAmount(account);
            }}
          />
        ),
      }}
      items={['All', 'Pending', 'Success', 'Refunded'].map((label, index) => ({
        label:
          label === 'Pending' ? (
            <Badge count={goOnAmount} offset={[10, 0]} color="blue">
              <span>{t(label)}</span>
            </Badge>
          ) : (
            t(label)
          ),
        key: String(index),
        children: (
          <>
            <Spin spinning={loading} className="mt-12 mx-auto w-full">
              {/*  eslint-disable-next-line complexity*/}
              {records.map((record) => {
                const { fromChain, toChain, recvToken } = record;
                const dep = getOriginChainConfig(fromChain);
                const arrival = getOriginChainConfig(toChain);
                const fromToken = getTokenConfigFromHelixRecord(record)!;
                const toToken = arrival.tokens.find((item) => item.symbol === recvToken)!;
                const [d2eHeight, d2dIndex] = record.requestTxHash.split('-');
                const [e2dHeight, e2dIndex] = record.responseTxHash.split('-');

                return (
                  <div className="flex justify-between items-center " key={record.id}>
                    <div className="flex-1 grid grid-cols-3 self-stretch pr-8 p-4 border border-gray-800 mb-4 bg-gray-900 rounded-xs">
                      <TokenOnChain
                        token={{ ...fromToken, meta: dep, amount: getSentAmountFromHelixRecord(record) }}
                        isFrom
                        asHistory
                      >
                        <ExplorerLink
                          network={dep}
                          txHash={record.requestTxHash}
                          extrinsic={d2eHeight && d2dIndex ? { height: d2eHeight, index: d2dIndex } : undefined}
                        >
                          <PaperClipOutlined className="hover:text-pangolin-main cursor-pointer" />
                        </ExplorerLink>
                      </TokenOnChain>

                      <BridgeArrow category={record.bridge} showName={false} />

                      <TokenOnChain
                        token={{ ...toToken, meta: arrival, amount: getReceivedAmountFromHelixRecord(record) }}
                        asHistory
                        className="justify-end"
                      >
                        {(record.responseTxHash || (e2dHeight && e2dIndex)) &&
                        record.result === RecordStatus.success ? (
                          <ExplorerLink
                            network={arrival}
                            txHash={record.responseTxHash}
                            extrinsic={e2dHeight && e2dIndex ? { height: e2dHeight, index: e2dIndex } : undefined}
                          >
                            <PaperClipOutlined className="hover:text-pangolin-main cursor-pointer" />
                          </ExplorerLink>
                        ) : (
                          record.result === RecordStatus.pending && (
                            <Tooltip
                              title={t('When the transaction is successful, the extrinsic message will be provided')}
                            >
                              <PaperClipOutlined className="cursor-pointer" />
                            </Tooltip>
                          )
                        )}
                      </TokenOnChain>
                    </div>

                    <div
                      onClick={() => {
                        if (isEthereumDarwinia(fromChain, toChain)) {
                          message.error(`Can not find the detail page for ${fromChain} to ${toChain}`);
                          return;
                        }

                        const paths = getDetailPaths(fromChain, toChain, record);
                        const query = new URLSearchParams({
                          from: record.fromChain,
                          to: record.toChain,
                        }).toString();

                        if (paths.length) {
                          window.open(`transaction/${paths.join('/')}?${query}`, '_blank');
                        }
                      }}
                      className={`text-right pl-4 pr-6 py-4  border border-gray-800 mb-4 bg-gray-900 rounded-xs ${
                        !isEthereumDarwinia(fromChain, toChain) ? 'cursor-pointer' : ''
                      }`}
                    >
                      <div className="mb-2 whitespace-nowrap text-xs">
                        {format(record.startTime * 1000, DATE_TIME_FORMAT)}
                      </div>

                      {record.result === RecordStatus.pending && <Pending record={record} />}

                      {record.result === RecordStatus.pendingToClaim && <PendingToClaim record={record} />}

                      {record.result === RecordStatus.pendingToRefund && (
                        <PendingToRefund record={record} onSuccess={() => fetchGoOnAmount(account)} />
                      )}

                      {record.result === RecordStatus.success && <div className="text-helix-green">{t('Success')}</div>}

                      {record.result === RecordStatus.pendingToConfirmRefund && (
                        <div className="text-helix-blue">{t('Refund Processing')}</div>
                      )}

                      {record.result === RecordStatus.refunded && <Refunded record={record} />}
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
            </Spin>

            {!records.length && <Empty description={t('No Data')} />}
          </>
        ),
      }))}
    ></Tabs>
  );
}
