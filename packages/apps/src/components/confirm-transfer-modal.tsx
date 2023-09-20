import { BaseBridge } from "@/bridges/base";
import { ChainToken } from "@/types/cross-chain";
import { TokenSymbol } from "@/types/token";
import Modal from "@/ui/modal";
import { formatBalance } from "@/utils/balance";
import { getChainConfig } from "@/utils/chain";
import { getChainLogoSrc } from "@/utils/misc";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  fee: bigint;
  sourceValue?: ChainToken | null;
  targetValue?: ChainToken | null;
  amount?: bigint | null;
  sender?: string | null;
  recipient?: string | null;
  bridge?: BaseBridge | null;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmTransferModal({
  isOpen,
  fee,
  sourceValue,
  targetValue,
  amount,
  sender,
  recipient,
  bridge,
  onClose,
  onCancel,
  onConfirm,
}: Props) {
  const sourceChain = getChainConfig(sourceValue?.network);
  const sourceToken = getChainConfig(sourceValue?.network)?.tokens.find(
    ({ symbol }) => sourceValue && sourceValue.symbol === symbol,
  );
  const targetChain = getChainConfig(targetValue?.network);
  const targetToken = getChainConfig(targetValue?.network)?.tokens.find(
    ({ symbol }) => targetValue && targetValue.symbol === symbol,
  );

  return (
    <Modal
      title="Confirm Transfer"
      isOpen={isOpen}
      className="w-full lg:w-[38rem]"
      okText="Confirm"
      onClose={onClose}
      onCancel={onCancel}
      onOk={onConfirm}
    >
      {/* from-to */}
      <div className="gap-small flex flex-col">
        {!!(sourceChain && sourceToken) && (
          <SourceTarget
            logo={sourceChain.logo}
            name={sourceChain.name}
            symbol={sourceToken.symbol}
            amount={amount || 0n}
            decimals={sourceToken.decimals}
            type="source"
          />
        )}
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
            <Image width={36} height={36} alt="Transfer to" src="images/transfer-to.svg" className="shrink-0" />
          </div>
        </div>
        {!!(targetChain && targetToken) && (
          <SourceTarget
            logo={targetChain.logo}
            name={targetChain.name}
            symbol={targetToken.symbol}
            amount={amount || 0n}
            decimals={targetToken.decimals}
            type="target"
          />
        )}
      </div>

      {/* information */}
      <div className="gap-middle flex flex-col">
        <span className="text-sm font-normal text-white">Information</span>
        {!!(sourceToken && bridge && sender && recipient) && (
          <Information
            fee={fee}
            decimals={sourceToken.decimals}
            symbol={sourceToken.symbol}
            bridge={bridge}
            sender={sender}
            recipient={recipient}
          />
        )}
      </div>
    </Modal>
  );
}

function SourceTarget({
  logo,
  name,
  symbol,
  amount,
  decimals,
  type,
}: {
  logo: string;
  name: string;
  symbol: TokenSymbol;
  amount: bigint;
  decimals: number;
  type: "source" | "target";
}) {
  return (
    <div className="bg-app-bg p-middle flex items-center justify-between rounded lg:p-5">
      {/* left */}
      <div className="gap-middle flex items-center">
        <Image width={36} height={36} alt="Chain" src={getChainLogoSrc(logo)} className="shrink-0 rounded-full" />
        <div className="flex flex-col items-start">
          <span className="text-base font-medium text-white">{name}</span>
          <span className="text-sm font-medium text-white/40">
            {type === "source" ? "Source Chain" : "Target Chain"}
          </span>
        </div>
      </div>

      {/* right */}
      <div className="flex flex-col items-end">
        <span className={`text-base font-medium ${type === "source" ? "text-app-red" : "text-app-green"}`}>
          {type === "source" ? "-" : "+"}
          {formatBalance(amount, decimals, { keepZero: false })}
        </span>
        <span className="text-sm font-medium text-white">{symbol}</span>
      </div>
    </div>
  );
}

function Information({
  fee,
  decimals,
  symbol,
  bridge,
  sender,
  recipient,
}: {
  fee: bigint;
  decimals: number;
  symbol: TokenSymbol;
  bridge: BaseBridge;
  sender: string;
  recipient: string;
}) {
  return (
    <div className="p-middle bg-app-bg gap-small flex flex-col rounded">
      <Item label="Bridge" value={bridge.getName()} />
      <Item label="From" value={sender} />
      <Item label="To" value={recipient} />
      <Item label="Transaction Fee" value={`${formatBalance(fee, decimals, { keepZero: false })} ${symbol}`} />
      <Item label="Estimated Arrival Time" value={bridge.getEstimateTime()} />
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="gap-middle flex items-center justify-between text-sm font-medium text-white">
      <span>{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
