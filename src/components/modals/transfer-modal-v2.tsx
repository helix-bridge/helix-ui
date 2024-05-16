import { BaseBridge } from "../../bridges";
import { ChainConfig, Token } from "../../types";
import Modal from "../../ui/modal";
import { formatBalance, getChainLogoSrc, toShortAdrress } from "../../utils";
import { Address } from "viem";

interface Props {
  sender?: Address | null;
  recipient?: Address | null;
  sourceChain: ChainConfig;
  sourceToken: Token;
  targetChain: ChainConfig;
  targetToken: Token;
  fee: { token: Token; value: bigint } | null | undefined;
  bridge: BaseBridge | undefined;
  amount: bigint;
  busy: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function TransferModalV2({
  sender,
  recipient,
  busy,
  fee,
  bridge,
  sourceChain,
  sourceToken,
  targetChain,
  targetToken,
  amount,
  isOpen,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal
      title="Transfer Review"
      isOpen={isOpen}
      className="w-full lg:w-[26rem]"
      okText="Confirm"
      disabledCancel={busy}
      busy={busy}
      onClose={onClose}
      onCancel={onClose}
      onOk={onConfirm}
    >
      <div className="flex flex-col gap-small">
        <SourceTarget type="source" address={sender} chain={sourceChain} token={sourceToken} amount={amount} />
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
            <img width={36} height={36} alt="Transfer to" src="images/transfer-to.svg" className="shrink-0" />
          </div>
        </div>
        <SourceTarget type="target" address={recipient} chain={targetChain} token={targetToken} amount={amount} />
      </div>

      <div className="flex flex-col gap-medium">
        <span className="text-sm font-bold text-white/50">Information</span>
        <Information fee={fee} bridge={bridge} />
      </div>
    </Modal>
  );
}

function SourceTarget({
  type,
  address,
  chain,
  token,
  amount,
}: {
  type: "source" | "target";
  amount: bigint;
  chain?: ChainConfig;
  token?: Token;
  address?: Address | null;
}) {
  return chain && token ? (
    <div className="flex items-start justify-between gap-2 rounded-xl bg-background p-3 lg:rounded-2xl lg:p-large">
      <img width={36} height={36} alt="Chain" src={getChainLogoSrc(chain.logo)} className="shrink-0 rounded-full" />

      <div className="flex w-full flex-col gap-1 truncate">
        <div className="flex items-center justify-between gap-1">
          <span className="max-w-[46%] truncate text-base font-semibold text-white">{chain.name}</span>
          <span
            className={`max-w-[46%] truncate text-sm font-extrabold ${type === "source" ? "text-app-red" : "text-app-green"}`}
          >
            {type === "source" ? "-" : "+"}
            {formatBalance(amount, token.decimals)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <span className="text-sm font-semibold text-white/50">{address ? toShortAdrress(address, 8, 6) : ""}</span>
          <span className="text-sm font-extrabold text-white">{token.symbol}</span>
        </div>
      </div>
    </div>
  ) : null;
}

function Information({ fee, bridge }: { fee?: { value: bigint; token: Token } | null; bridge?: BaseBridge | null }) {
  return (
    <div className="flex flex-col gap-small rounded-xl bg-background p-3 lg:rounded-2xl lg:p-large">
      <Item label="Estimated Arrival Time" value={bridge?.formatEstimateTime()} />
      <Item
        label="Transaction Fee"
        value={fee ? `${formatBalance(fee.value, fee.token.decimals, { precision: 6 })} ${fee.token.symbol}` : null}
      />
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-medium text-sm font-bold italic text-white">
      <span>{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
