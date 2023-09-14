"use client";

import { QUERY_RECORD_BY_ID } from "@/config";
import { RecordResponseData, RecordVariables } from "@/types";
import { Divider } from "@/ui/divider";
import { RecordLabel } from "@/components/record-label";
import { useQuery } from "@apollo/client";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import TransferRoute from "@/components/transfer-route";
import TransactionStatus from "@/components/transaction-status";
import { TransactionHash } from "@/components/transaction-hash";
import TransactionTimestamp from "@/components/transaction-timestamp";
import PrettyAddress from "@/components/pretty-address";
import TransactionValue from "@/components/transaction-value";
import TokenToReceive from "@/components/token-to-receive";
import { BaseBridge, LnBridgeDefault, LnBridgeOpposite } from "helix.js";
import { usePublicClient, useWalletClient } from "wagmi";
import TokenTransfer from "@/components/token-transfer";
import ComponentLoading from "@/components/component-loading";

interface Props {
  params: {
    id: string;
  };
}

export default function RecordDetail({ params }: Props) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { loading, data: record } = useQuery<RecordResponseData, RecordVariables>(QUERY_RECORD_BY_ID, {
    variables: { id: params.id },
  });
  const [bridge, setBridge] = useState<BaseBridge>();

  useEffect(() => {
    const category = record?.historyRecordById?.bridge;
    const sourceChain = record?.historyRecordById?.fromChain;
    const targetChain = record?.historyRecordById?.toChain;
    const sourceToken = record?.historyRecordById?.sendToken;
    const targetToken = record?.historyRecordById?.recvToken;

    if (category && sourceChain && targetChain && sourceToken && targetToken && publicClient && walletClient) {
      if (category === "lnbridgev20-default") {
        setBridge(
          new LnBridgeDefault({ sourceChain, targetChain, sourceToken, targetToken, publicClient, walletClient }),
        );
      } else if (category === "lnbridgev20-opposite") {
        setBridge(
          new LnBridgeOpposite({ sourceChain, targetChain, sourceToken, targetToken, publicClient, walletClient }),
        );
      }
    }
  }, [record?.historyRecordById, publicClient, walletClient]);

  return (
    <main className="app-main">
      <div className="px-middle container mx-auto">
        <h3 className="my-5 text-xl font-semibold text-white">Transaction Detail</h3>
        <div className="overflow-x-auto">
          <div className="bg-component py-middle gap-middle relative flex min-w-max flex-col rounded px-7">
            {/* loading */}
            <ComponentLoading loading={loading} className="rounded" />

            <Section label="Transfer Route">
              <TransferRoute
                bridge={record?.historyRecordById?.bridge}
                fromChain={record?.historyRecordById?.fromChain}
                toChain={record?.historyRecordById?.toChain}
              />
            </Section>

            <Divider />

            <Section label="Status" tips="The status of the cross-chain transaction: Success, Pending, or Refunded.">
              <TransactionStatus record={record?.historyRecordById} />
            </Section>
            <Section
              label="Source Tx Hash"
              tips="Unique character string (TxID) assigned to every verified transaction on the Source Chain."
            >
              <TransactionHash
                chain={record?.historyRecordById?.fromChain}
                txHash={record?.historyRecordById?.requestTxHash}
              />
            </Section>
            <Section
              label="Target Tx Hash"
              tips="Unique character string (TxID) assigned to every verified transaction on the Target Chain."
            >
              <TransactionHash
                chain={record?.historyRecordById?.toChain}
                txHash={record?.historyRecordById?.responseTxHash}
              />
            </Section>
            <Section
              label="Timestamp"
              tips="The date and time at which a transaction is mined. And the time period elapsed for the completion of the cross-chain."
            >
              <TransactionTimestamp record={record?.historyRecordById} />
            </Section>

            <Divider />

            <Section label="Sender" tips="Address (external or contract) sending the transaction.">
              {record?.historyRecordById?.sender ? (
                <PrettyAddress
                  address={record.historyRecordById.sender}
                  className="text-primary text-sm font-normal"
                  copyable
                />
              ) : null}
            </Section>
            <Section label="Receiver" tips="Address (external or contract) receiving the transaction.">
              {record?.historyRecordById?.recipient ? (
                <PrettyAddress
                  address={record.historyRecordById.recipient}
                  className="text-primary text-sm font-normal"
                  copyable
                />
              ) : null}
            </Section>
            <Section label="Token Transfer" tips="List of tokens transferred in this cross-chain transaction.">
              <TokenTransfer record={record?.historyRecordById} bridge={bridge} />
            </Section>
            <Section label="Token To Receive">
              <TokenToReceive record={record?.historyRecordById} />
            </Section>

            <Divider />

            <Section
              label="Value"
              tips="The amount to be transferred to the recipient with the cross-chain transaction."
            >
              <TransactionValue record={record?.historyRecordById} />
            </Section>
            <Section label="Transaction Fee" tips="Amount paid for processing the cross-chain transaction.">
              <TransactionValue record={record?.historyRecordById} />
            </Section>

            <Divider />

            <Section label="Nonce" tips="A unique number of cross-chain transaction in Bridge.">
              {record?.historyRecordById?.nonce ? (
                <span className="text-sm font-normal text-white">{record.historyRecordById.nonce}</span>
              ) : null}
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({ label, tips, children }: PropsWithChildren<{ label: string; tips?: string }>) {
  return (
    <div className="gap-middle flex h-11 items-center">
      <RecordLabel text={label} tips={tips} />
      {children}
    </div>
  );
}
