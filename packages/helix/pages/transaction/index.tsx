import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { Affix, Button, Input, Pagination, Spin } from 'antd';
import request, { gql } from 'graphql-request';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, map } from 'rxjs';
import { ENDPOINT } from 'shared/config/env';
import { HelixHistoryRecord } from 'shared/model';
import { convertToDvm, gqlName, isValidAddress } from 'shared/utils/helper';
import { chainConfigs } from 'shared/utils/network';
import { Record } from '../../components/transaction/Record';
import { ViewBoard } from '../../components/transaction/ViewBoard';
import { useAccountStatistic, useDailyStatistic } from '../../hooks';

const HISTORY_RECORDS = gql`
  query historyRecords($row: Int!, $page: Int!, $sender: String, $recipient: String) {
    historyRecords(row: $row, page: $page, sender: $sender, recipient: $recipient) {
      total
      records {
        id
        bridge
        fromChain
        toChain
        laneId
        nonce
        requestTxHash
        responseTxHash
        sender
        recipient
        token
        amount
        startTime
        endTime
        result
        fee
      }
    }
  }
`;

const PAGE_SIZE = 10;

function Page({ records, count }: { records: HelixHistoryRecord[]; count: number }) {
  const { t } = useTranslation('common');
  const [isValidSender, setIsValidSender] = useState(true);
  const { data: dailyStatistic } = useDailyStatistic();
  const { total: accountTotal } = useAccountStatistic(ENDPOINT);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(count);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const transactionsTotal = useMemo(
    () => (dailyStatistic?.dailyStatistics || []).reduce((acc, cur) => acc + cur.dailyCount, 0) ?? '-',
    [dailyStatistic]
  );

  const [account, setAccount] = useState<string | undefined>();
  const [source, setSource] = useState<HelixHistoryRecord[]>(records);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const args = {
      page: page - 1,
      row: pageSize,
      sender: account,
      recipient: account,
    };

    const sub$$ = from(request(ENDPOINT, HISTORY_RECORDS, args))
      .pipe(map((res) => res && res[gqlName(HISTORY_RECORDS)]))
      .subscribe((result) => {
        setTotal(result.total);
        setSource(result.records);
        setLoading(false);
      });

    return () => sub$$.unsubscribe();
  }, [account, page, pageSize]);

  return (
    <div>
      <div className="grid lg:grid-cols-3 gap-0 lg:gap-6 place-items-center my-4 lg:my-6">
        <ViewBoard title={t('transactions')} count={transactionsTotal} />
        <ViewBoard title={t('unique users')} count={accountTotal} />
        <ViewBoard title={t('supported blockchains')} count={chainConfigs.length} />
      </div>

      <Affix offsetTop={64}>
        <div>
          <div className="flex justify-between">
            <Input
              size="large"
              suffix={<SearchOutlined />}
              allowClear
              onChange={(event) => {
                const value = event.target.value;

                if (!value) {
                  setIsValidSender(true);
                  setSource([]);
                  setAccount(undefined);
                  setPage(1);
                }

                try {
                  const address = isValidAddress(value, 'ethereum') ? value : convertToDvm(value);

                  setSource([]);
                  setAccount(address);
                  setPage(1);
                  setIsValidSender(true);
                } catch {
                  setIsValidSender(false);
                }
              }}
              placeholder={t('Search by address')}
              className={`max-w-md ${isValidSender ? '' : 'border-red-400'}`}
            />

            <Button
              type="link"
              onClick={() => {
                if (page === 1) {
                  setLoading(true);
                  from(
                    request(ENDPOINT, HISTORY_RECORDS, { page: 0, row: pageSize, sender: account, recipient: account })
                  )
                    .pipe(map((res) => res && res[gqlName(HISTORY_RECORDS)]))
                    .subscribe((result) => {
                      setTotal(result.total);
                      setSource(result.records);
                      setLoading(false);
                    });
                } else {
                  setPage(1);
                }
              }}
              disabled={loading}
              className="flex items-center cursor-pointer"
            >
              <span className="mr-2">{t('Latest transactions')}</span>
              <SyncOutlined />
            </Button>
          </div>

          <div className="mt-4 lg:mt-6 grid grid-cols-12 border-b border-gray-500 items-center p-4 bg-gray-200 dark:bg-antDark">
            <span className="mr-5">{t('Time')}</span>
            <span className="col-span-3 overflow-hidden pl-4 pr-2">{t('From')}</span>
            <span className="col-span-3 overflow-hidden pl-2 pr-4">{t('To')}</span>
            <span>{t('Asset')}</span>
            <span className="justify-self-center">{t('Amount')}</span>
            <span className="justify-self-center">{t('Fee')}</span>
            <span className="justify-self-center">{t('Bridge')}</span>
            <span>{t('Status')}</span>
          </div>

          <div
            // header: 64px search box: 40px table header + margin: 78px footer 54px
            style={{ height: 'calc(100vh - 40px - 64px - 78px - 54px)' }}
            className="overflow-auto"
          >
            {loading ? (
              <Spin spinning={loading} size="large" className="w-full" style={{ margin: '1em' }} />
            ) : (
              <div style={{ width: '100%', position: 'relative' }}>
                {source.map((record, index) => {
                  const bg = index % 2 === 0 ? 'bg-gray-200 dark:bg-antDark' : '';

                  return (
                    <div
                      className={`grid grid-cols-12 items-center py-2 px-4 cursor-pointer transition-all duration-300 
                      hover:bg-gray-400 dark:hover:bg-gray-800 ${bg}`}
                      key={record.id}
                    >
                      <Record record={record} />
                    </div>
                  );
                })}
              </div>
            )}

            <Pagination
              pageSize={pageSize}
              current={page}
              total={total}
              onChange={(current: number, size: number) => {
                setPage(current);
                setPageSize(size);
              }}
              style={{ margin: '1em 0' }}
              className="text-right"
            />
          </div>
        </div>
      </Affix>
    </div>
  );
}

export async function getStaticProps() {
  const translations = await serverSideTranslations('en', ['common']);

  const { records, total } = await request(ENDPOINT, HISTORY_RECORDS, {
    row: PAGE_SIZE,
    page: 0,
  }).then((res) => res && res[gqlName(HISTORY_RECORDS)]);

  return {
    props: {
      ...translations,
      records,
      count: total,
    },
    revalidate: 10,
  };
}

export default Page;
