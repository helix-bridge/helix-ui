import { LoadingOutlined, PaperClipOutlined, ReloadOutlined, SwapOutlined } from '@ant-design/icons';
import { Button, Empty, Pagination, Radio, Result, Spin, Tabs, Tooltip } from 'antd';
import { format } from 'date-fns';
import request from 'graphql-request';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EMPTY, from, map } from 'rxjs';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { CrossChainStatus, DATE_TIME_FORMAT } from 'shared/config/constant';
import { ENDPOINT } from 'shared/config/env';
import { HelixHistoryRecord, ICamelCaseKeys } from 'shared/model';
import { isDarwinia2Ethereum } from 'shared/utils/bridge';
import { convertToDvm, gqlName, isValidAddress } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import {
  getReceiveAmountFromHelixRecord,
  getSendAmountFromHelixRecord,
  getTokenNameFromHelixRecord,
} from 'shared/utils/record';
import { useDarwinia2EthereumClaim } from '../../bridges/ethereum-darwinia/hooks/claim';
import { Darwinia2EthereumHistoryRes, Darwinia2EthereumRecord } from '../../bridges/ethereum-darwinia/model';
import { HISTORY_RECORDS } from '../../config/gql';
import { useITranslation } from '../../hooks';
import { Paginator } from '../../model';
import { useAccount, useApi } from '../../providers';
import { fetchDarwinia2EthereumRecords, fetchEthereum2DarwiniaRecords } from '../../utils/records';
import { BridgeArrow } from '../bridge/BridgeArrow';
import { TokenOnChain } from '../widget/TokenOnChain';

enum HistoryType {
  ethereumDarwinia = 1,
  normal,
}

// eslint-disable-next-line complexity
export function Personal() {
  const { t } = useITranslation();
  const [result, setResult] = useState<number | null>(null);
  const { account } = useAccount();
  const { connectDepartureNetwork, departure, isConnecting, departureConnection } = useApi();
  const [historyType, setHistoryType] = useState<HistoryType>(HistoryType.normal);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState<HelixHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginator, setPaginator] = useState<Paginator>({ row: 10, page: 0 });
  const { claim, claimedList, isClaiming } = useDarwinia2EthereumClaim();
  const [claimMeta, setClaimMeta] = useState<Omit<Darwinia2EthereumHistoryRes, 'list' | 'count'> | null>(null);

  const records = useMemo<HelixHistoryRecord[]>(() => {
    if (historyType === HistoryType.ethereumDarwinia && departureConnection.type === 'polkadot') {
      return source.map((item) => {
        const target = claimedList.find((claimed) => claimed.id === item.id);

        return target ? { ...item, targetTxHash: target.hash, result: 1 } : item;
      });
    }

    return source;
  }, [claimedList, departureConnection.type, historyType, source]);

  const fetchData = useCallback(() => {
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

  const fetchEthereumDarwiniaData = useCallback(() => {
    const params = {
      address: account,
      paginator,
      confirmed: typeof result === 'number' ? !!result : result,
    };

    if (departureConnection.type === 'polkadot') {
      return fetchDarwinia2EthereumRecords(params, departure).subscribe({
        next: (response) => {
          const { list, count, ...rest } = response;
          setTotal(count);
          setSource(list);
          setClaimMeta(rest);
        },
        error: () => setLoading(false),
        complete: () => setLoading(false),
      });
    }

    if (departureConnection.type === 'metamask') {
      return fetchEthereum2DarwiniaRecords(params, departure).subscribe({
        next: (response) => {
          const { list, count } = response;

          setTotal(count);
          setSource(list);
        },
        error: () => setLoading(false),
        complete: () => setLoading(false),
      });
    }

    return EMPTY.subscribe();
  }, [account, departure, departureConnection.type, paginator, result]);

  useEffect(() => {
    if (!account) {
      setSource([]);
      setClaimMeta(null);
      return;
    }

    const sub$$ = historyType === HistoryType.normal ? fetchData() : fetchEthereumDarwiniaData();

    return () => sub$$?.unsubscribe();
  }, [account, fetchData, fetchEthereumDarwiniaData, historyType]);

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
    <>
      <Radio.Group
        onChange={(event) => setHistoryType(+event.target.value)}
        defaultValue={historyType}
        buttonStyle="solid"
        size="large"
        className="w-full mb-4"
      >
        <Radio.Button value={HistoryType.ethereumDarwinia} className="w-1/2 text-center bg-transparent">
          <div className="flex items-center justify-center">
            <span>Ethereum</span>
            <SwapOutlined className="mx-4" />
            <span>Darwinia</span>
          </div>
        </Radio.Button>

        <Radio.Button value={HistoryType.normal} className="w-1/2 text-center bg-transparent">
          {t('Others')}
        </Radio.Button>
      </Radio.Group>

      <Tabs
        defaultActiveKey="-1"
        onTabClick={(key) => {
          const res = Number(key) - 1;

          setResult(res < 0 ? null : res);
          setPaginator({ row: 10, page: 0 });
        }}
        tabBarExtraContent={{
          right: (
            <ReloadOutlined
              onClick={() => {
                setTotal(0);
                setSource([]);
                setClaimMeta(null);

                if (historyType === HistoryType.ethereumDarwinia) {
                  fetchEthereumDarwiniaData();
                } else {
                  fetchData();
                }
              }}
            />
          ),
        }}
      >
        {['All', 'Pending', 'Success']
          .concat(historyType === HistoryType.ethereumDarwinia ? [] : ['Refund'])
          .map((label, index) => (
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
              <Spin spinning={loading} className="mt-12 mx-auto w-full">
                {/*  eslint-disable-next-line complexity*/}
                {records.map((record) => {
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
                  const [d2eHeight, d2dIndex] = record.requestTxHash.split('-');
                  const [e2dHeight, e2dIndex] = record.targetTxHash.split('-');

                  return (
                    <div className="flex justify-between items-center " key={record.id}>
                      <div className="flex-1 flex justify-between self-stretch pr-8 p-4 border border-gray-800 mb-4 bg-gray-900 rounded-xs">
                        <TokenOnChain
                          token={{ ...fromToken, meta: dep, amount: getSendAmountFromHelixRecord(record) }}
                          isFrom
                          asHistory
                        >
                          <SubscanLink
                            network={dep}
                            txHash={record.requestTxHash}
                            extrinsic={d2eHeight && d2dIndex ? { height: d2eHeight, index: d2dIndex } : undefined}
                          >
                            <PaperClipOutlined className="hover:text-pangolin-main cursor-pointer" />
                          </SubscanLink>
                        </TokenOnChain>

                        <BridgeArrow category={record.bridge} showName={false} />

                        <TokenOnChain
                          token={{ ...toToken, meta: arrival, amount: getReceiveAmountFromHelixRecord(record) }}
                          asHistory
                          className="justify-end"
                        >
                          {record.targetTxHash || (e2dHeight && e2dIndex) ? (
                            <SubscanLink
                              network={arrival}
                              txHash={record.targetTxHash}
                              extrinsic={e2dHeight && e2dIndex ? { height: e2dHeight, index: e2dIndex } : undefined}
                            >
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

                      <div className="text-right w-1/5 pl-4 pr-6 py-3  border border-gray-800 mb-4 bg-gray-900 rounded-xs">
                        <div className="mb-2">{format(record.startTime * 1000, DATE_TIME_FORMAT)}</div>

                        {record.result === CrossChainStatus.pending && (
                          <div className="flex items-center justify-end gap-2">
                            {!isDarwinia2Ethereum(fromChain, toChain) ? (
                              <span className="text-helix-blue">{t('Waiting for fund release')}</span>
                            ) : (
                              <Button
                                disabled={isClaiming}
                                size="small"
                                onClick={() =>
                                  claim(
                                    record as ICamelCaseKeys<Darwinia2EthereumRecord & HelixHistoryRecord>,
                                    claimMeta!
                                  )
                                }
                              >
                                {t('Claim')}
                              </Button>
                            )}
                          </div>
                        )}

                        {record.result === CrossChainStatus.success && (
                          <div className="text-helix-green">{t('Success')}</div>
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
              </Spin>

              {!records.length && <Empty description={t('No Data')} />}
            </Tabs.TabPane>
          ))}
      </Tabs>
    </>
  );
}
