"use client";

import { BaseBridge } from "@/bridges";
import { GQL_HISTORY_RECORD_BY_ID } from "@/config";
import { HistoryRecordReqParams, HistoryRecordResData, RecordResult } from "@/types";
import ComponentLoading from "@/ui/component-loading";
import CountdownRefresh from "@/ui/countdown-refresh";
import { bridgeFactory, getChainConfig } from "@/utils";
import { useQuery } from "@apollo/client";
import { PropsWithChildren, useMemo } from "react";
import TransferRoute from "./transfer-route";
import TransactionStatus from "./transaction-status";
import { TransactionHash } from "./transaction-hash";
import TransactionTimestamp from "./transaction-timestamp";
import PrettyAddress from "./pretty-address";
import TokenTransfer from "./token-transfer";
import TokenToReceive from "./token-to-receive";
import TransactionValue from "./transaction-value";
import TransactionFee from "./transaction-fee";
import { RecordItemTitle } from "@/ui/record-item-title";

interface Props {
  id: string;
}

export default function RecordDetail(props: Props) {
  const {
    loading,
    data: record,
    refetch,
  } = useQuery<HistoryRecordResData, HistoryRecordReqParams>(GQL_HISTORY_RECORD_BY_ID, {
    variables: { id: props.id },
    notifyOnNetworkStatusChange: true,
  });

  const bridgeInstance = useMemo<BaseBridge | undefined>(() => {
    const category = record?.historyRecordById?.bridge;
    const sourceChain = getChainConfig(record?.historyRecordById?.fromChain);
    const targetChain = getChainConfig(record?.historyRecordById?.toChain);
    const sourceToken = sourceChain?.tokens.find((t) => t.symbol === record?.historyRecordById?.sendToken);
    const targetToken = targetChain?.tokens.find((t) => t.symbol === record?.historyRecordById?.recvToken);

    if (category) {
      return bridgeFactory({ category, sourceChain, targetChain, sourceToken, targetToken });
    }
    return undefined;
  }, [record?.historyRecordById]);

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between gap-5">
        <h3 className="text-lg font-medium text-white">Transaction Detail</h3>
        <CountdownRefresh onClick={refetch} />
      </div>
      <div className="mt-5 overflow-x-auto">
        <div className="relative flex min-w-max flex-col gap-middle rounded-large bg-component px-7 py-middle">
          {/* loading */}
          <ComponentLoading loading={loading} className="rounded-large" />

          <Item label="Transfer Route">
            <TransferRoute record={record?.historyRecordById} />
          </Item>

          <Divider />

          <Item label="Status" tips="The status of the cross-chain transaction: Success, Pending, or Refunded.">
            <TransactionStatus record={record?.historyRecordById} />
          </Item>
          <Item label="Request Tx Hash" tips="Unique character string (TxID) assigned to every verified transaction.">
            <TransactionHash
              chain={record?.historyRecordById?.fromChain}
              txHash={record?.historyRecordById?.requestTxHash}
            />
          </Item>
          <Item label="Response Tx Hash" tips="Unique character string (TxID) assigned to every verified transaction.">
            <TransactionHash
              chain={
                isRefundStatus(record?.historyRecordById?.result)
                  ? record?.historyRecordById?.fromChain
                  : record?.historyRecordById?.toChain
              }
              txHash={record?.historyRecordById?.responseTxHash}
            />
          </Item>
          <Item
            label="Timestamp"
            tips="The date and time at which a transaction is mined. And the time period elapsed for the completion of the cross-chain."
          >
            <TransactionTimestamp record={record?.historyRecordById} />
          </Item>

          <Divider />

          <Item label="Sender" tips="Address (external or contract) sending the transaction.">
            {record?.historyRecordById?.sender ? (
              <PrettyAddress
                address={record.historyRecordById.sender}
                className="text-sm font-medium text-primary"
                copyable
              />
            ) : null}
          </Item>
          <Item label="Receiver" tips="Address (external or contract) receiving the transaction.">
            {record?.historyRecordById?.recipient ? (
              <PrettyAddress
                address={record.historyRecordById.recipient}
                className="text-sm font-medium text-primary"
                copyable
              />
            ) : null}
          </Item>
          <Item label="Token Transfer" tips="List of tokens transferred in this cross-chain transaction.">
            <TokenTransfer record={record?.historyRecordById} bridge={bridgeInstance} />
          </Item>
          <Item label="Token To Receive">
            <TokenToReceive record={record?.historyRecordById} />
          </Item>

          <Divider />

          <Item label="Value" tips="The amount to be transferred to the recipient with the cross-chain transaction.">
            <TransactionValue record={record?.historyRecordById} />
          </Item>
          <Item label="Transaction Fee" tips="Amount paid for processing the cross-chain transaction.">
            <TransactionFee record={record?.historyRecordById} />
          </Item>

          <Divider />

          <Item label="Nonce" tips="A unique number of cross-chain transaction in Bridge.">
            {record?.historyRecordById?.nonce ? (
              <span className="text-sm font-medium text-white">{record.historyRecordById.nonce}</span>
            ) : null}
          </Item>
        </div>
      </div>
    </div>
  );
}

function Item({ label, tips, children }: PropsWithChildren<{ label: string; tips?: string }>) {
  return (
    <div className="flex flex-col items-start gap-small lg:h-11 lg:flex-row lg:items-center lg:gap-middle">
      <RecordItemTitle text={label} tips={tips} />
      <div className="pl-5 lg:pl-0">{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="h-[1px] w-full bg-white/10" />;
}

function isRefundStatus(result: RecordResult | undefined) {
  return (
    result === RecordResult.PENDING_TO_CONFIRM_REFUND ||
    result === RecordResult.PENDING_TO_REFUND ||
    result === RecordResult.REFUNDED
  );
}
