import Modal from "@/ui/modal";
import SegmentedTabs, { SegmentedTabsProps } from "@/ui/segmented-tabs";
import Tooltip from "@/ui/tooltip";
import Image from "next/image";
import { PropsWithChildren, useState } from "react";
import { BalanceInput } from "./balance-input";
import LiquidityFeeRateInput from "./liquidity-fee-rate-input";

type TabKey = "update" | "deposit" | "withdraw";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RelayerManageModal({ isOpen, onClose }: Props) {
  const [activeKey, setActiveKey] = useState<SegmentedTabsProps<TabKey>["activeKey"]>("update");
  const [height, setHeight] = useState<number>();

  return (
    <Modal
      title="Manage Relayer"
      className="w-full lg:w-[42.5rem]"
      okText="Confirm"
      isOpen={isOpen}
      onClose={onClose}
      onOk={onClose}
      onCancel={onClose}
    >
      <SegmentedTabs
        options={[
          {
            key: "update",
            label: "Update Fee",
            children: (
              <div className="flex flex-col gap-5" ref={(node) => setHeight((prev) => node?.clientHeight || prev)}>
                <LabelSection label="Base Fee Amount">
                  <BalanceInput chainToken={{ network: "goerli", symbol: "USDC" }} />
                </LabelSection>
                <LabelSection label="Liquidity Fee Rate">
                  <LiquidityFeeRateInput />
                </LabelSection>
              </div>
            ),
          },
          {
            key: "deposit",
            label: "Deposit More Margin",
            children: (
              <LabelSection label="Deposit Amount" height={height}>
                <BalanceInput chainToken={{ network: "goerli", symbol: "USDC" }} />
              </LabelSection>
            ),
          },
          // {
          //   key: "withdraw",
          //   label: (
          //     <div className="gap-small flex items-center justify-center">
          //       <span className="text-sm font-medium">Withdraw Margin</span>
          //       <Tooltip
          //         content={
          //           <span className="text-xs font-normal text-white">
          //             A cross-chain message is required to perform a `withdraw margin` operation
          //           </span>
          //         }
          //         contentClassName="w-60"
          //         className="w-fit"
          //       >
          //         <Image width={16} height={16} alt="Info" src="/images/info.svg" />
          //       </Tooltip>
          //     </div>
          //   ),
          //   children: (
          //     <LabelSection label="Withdraw Amount" height={height}>
          //       <BalanceInput chainToken={{ network: "goerli", symbol: "USDC" }} />
          //     </LabelSection>
          //   ),
          // },
        ]}
        activeKey={activeKey}
        onChange={setActiveKey}
      />
    </Modal>
  );
}

function LabelSection({ label, children, height }: PropsWithChildren<{ label: string; height?: number }>) {
  return (
    <div className="gap-middle flex flex-col" style={{ height }}>
      <span className="text-sm font-normal">{label}</span>
      {children}
    </div>
  );
}
