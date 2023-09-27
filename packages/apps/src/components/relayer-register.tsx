"use client";

import Button from "@/ui/button";
import { Divider } from "@/ui/divider";
import StepNumber from "@/ui/step-number";
import { PropsWithChildren, useState } from "react";
import ChainSelect from "./chain-select";
import TokenSelect from "./token-select";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { BridgeCategory } from "@/types/bridge";
import { useAccount } from "wagmi";
import Image from "next/image";
import { getChainLogoSrc, getTokenLogoSrc } from "@/utils/misc";
import Tooltip from "@/ui/tooltip";
import StepCompleteItem from "./step-complete-item";
import { BalanceInput } from "./balance-input";
import Modal from "@/ui/modal";
import PrettyAddress from "./pretty-address";

enum Step {
  ONE,
  COMPLETE_ONE,
  TWO,
  COMPLETE_TWO,
  THREE,
  COMPLETE_THREE,
}

export default function RelayerRegister() {
  const [currentStep, setCurrentStep] = useState(Step.ONE);
  const [sourceChain, setSourceChain] = useState<Network>();
  const [targetChain, setTargetChain] = useState<Network>();
  const [token, setToken] = useState<TokenSymbol>();
  const [bridgeCategory, setBridgeCategory] = useState<BridgeCategory>();
  const [isOpen, setIsOpen] = useState(false);

  const { address } = useAccount();

  return (
    <>
      <div className="flex w-full flex-col gap-5 lg:w-[38.75rem]">
        {/* step 1 */}
        <div className="bg-component flex flex-col gap-5 p-5 lg:p-[1.875rem]">
          <StepTitle step={1} title="Select Chain and Token" />

          {Step.ONE === currentStep && (
            <>
              <Description content="Different source chains and target chains correspond to different bridge types. In different bridge types, the relayer is required to set margin on different chains. When the bridge type is 'default', the relayer needs to set margin on the target chain. If the bridge type is 'opposite', the relayer must set margin on the source chain." />

              <Divider />

              <div className="gap-middle flex items-center lg:gap-5">
                <LabelItem label="From" className="flex-1">
                  <ChainSelect options={[]} placeholder="Source chain" />
                </LabelItem>
                <LabelItem label="To" className="flex-1">
                  <ChainSelect options={[]} placeholder="Target chain" />
                </LabelItem>
              </div>

              <LabelItem label="Token">
                <TokenSelect options={[]} placeholder="Select token" />
              </LabelItem>

              <Divider />

              <Button kind="primary" className="flex h-9 items-center justify-center">
                <span className="text-sm font-medium text-white">Confirm</span>
              </Button>
            </>
          )}
          {Step.COMPLETE_ONE <= currentStep && (
            <>
              <Divider />

              <div className="gap-small flex items-center justify-between">
                <StepCompleteItem property="Address" address={address} />
                <StepCompleteItem property="Bridge Type" bridge={bridgeCategory} />
                <StepCompleteItem property="From" network={sourceChain} />
                <StepCompleteItem property="To" network={targetChain} />
                {sourceChain && token ? (
                  <StepCompleteItem property="Token" chainToken={{ network: sourceChain, symbol: token }} />
                ) : null}
              </div>

              <Divider />

              <div className="flex items-center gap-5">
                <Button kind="default" className="flex h-9 flex-1 items-center justify-center">
                  <span className="text-sm font-medium text-white">Reset</span>
                </Button>
                <Button kind="primary" className="flex h-9 flex-1 items-center justify-center">
                  <span className="text-sm font-medium text-white">Next</span>
                </Button>
              </div>
            </>
          )}
        </div>

        {/* step 2 */}
        <div className="bg-component flex flex-col gap-5 p-5 lg:p-[1.875rem]">
          <StepTitle step={2} title="Deposit Margin and Set Fee" />

          {Step.TWO === currentStep && (
            <>
              <Description content="When a relayer engages in misconduct, their margin will be used for compensation. The fee charged by the relayer in the source chain from user transactions is baseFee + transferAmount * liquidityFeeRate." />

              <Divider />

              <LabelItem label="Deposit Margin">
                <BalanceInput chainToken={{ network: "arbitrum", symbol: "USDC" }} />
              </LabelItem>
              <LabelItem label="Base Fee" tips="The fixed fee set by the relayer and charged in a transaction">
                <BalanceInput chainToken={{ network: "arbitrum", symbol: "USDC" }} />
              </LabelItem>
              <LabelItem
                label="Liquidity Fee Rate"
                tips="The percentage deducted by the relayer from the transfer amount in a transaction"
              >
                <LiquidityFeeRateInput />
              </LabelItem>

              <Divider />

              <Button kind="primary" className="flex h-9 items-center justify-center">
                <span className="text-sm font-medium text-white">Approve</span>
              </Button>
            </>
          )}
          {Step.COMPLETE_TWO <= currentStep && (
            <>
              <Divider />
              <div className="gap-small flex items-center justify-between">
                <StepCompleteItem
                  property="Margin"
                  chainToken={{ network: "arbitrum", symbol: "USDC" }}
                  balance={100000n}
                />
                <StepCompleteItem
                  property="Base Fee"
                  chainToken={{ network: "arbitrum", symbol: "USDC" }}
                  balance={100000n}
                />
                <StepCompleteItem property="Liquidity Fee Rate" percent={1} />
              </div>
            </>
          )}
        </div>

        {/* step 3 */}
        <div className="bg-component flex flex-col gap-5 p-5 lg:p-[1.875rem]">
          <StepTitle step={3} title="Authorize Token on Target Chain and Run Relayer" />

          {Step.THREE === currentStep && (
            <>
              <Description content="Authorize token on target chain and run relayer to start relaying messages and earn rewards. Please note this step authorizes tokens for the relayer to send to users' target chain address based on transactions. Ensure you authorize enough tokens for multiple transactions as needed." />

              <Divider />

              <div className="gap-small p-small lg:p-middle flex items-center">
                <div className="relative w-fit">
                  <Image
                    width={30}
                    height={30}
                    alt="Token"
                    src={getTokenLogoSrc("usdt.svg")}
                    className="rounded-full"
                  />
                  <Image
                    width={16}
                    height={16}
                    alt="Chain"
                    src={getChainLogoSrc("crab.svg")}
                    className="absolute -bottom-1 -right-1 rounded-full"
                  />
                </div>
                <span className="text-sm font-medium text-white">{"RING"}</span>
              </div>
              <Button kind="primary" className="flex h-9 items-center justify-center">
                <span className="text-sm font-medium text-white">Approve</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <Modal
        className="w-full lg:w-[37.5rem]"
        title="One More Step!"
        subTitle={
          <div className="text-sm font-normal text-white">
            Now <RunRelayer className="lg:py-small px-middle py-1" /> to start relaying messages and earn rewards.
          </div>
        }
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div
          className="gap-x-small grid items-center gap-y-5 text-sm font-normal text-white"
          style={{ gridTemplateColumns: "130px auto" }}
        >
          <span>Address</span>
          <PrettyAddress address="0x2tJaxND51vBbPwUDHuhVzndY4MeohvvHvn3D9uDejYN" />

          <span>Bridge Type</span>
          <span>Default</span>

          <span>From</span>
          <div className="flex items-center">
            <span>Ethereum</span>
          </div>

          <span>To</span>
          <div className="flex items-center">
            <span>Darwinia</span>
          </div>

          <span>Token</span>
          <div className="flex items-center">
            <span>RING</span>
          </div>

          <span>Margin</span>
          <span>100,000</span>

          <span>Base Fee</span>
          <span>100,000</span>

          <span>Liquidity Fee Rate</span>
          <span>1%</span>
        </div>

        <Divider />

        <div className="gap-middle flex items-center lg:gap-5">
          <RunRelayer className="inline-flex h-8 flex-1 items-center justify-center lg:h-9" />
          <Button kind="default" className="h-8 flex-1 lg:h-9">
            <span className="text-sm font-normal">Register another Relayer</span>
          </Button>
        </div>
      </Modal>
    </>
  );
}

function RunRelayer({ className, onClick = () => undefined }: { className?: string; onClick?: () => void }) {
  return (
    <a
      href="https://github.com/helix-bridge/relayer/tree/lnv2"
      className={`bg-primary rounded text-sm font-medium text-white transition hover:opacity-80 active:translate-y-1 ${className}`}
      rel="noopener"
      target="_blank"
      onClick={onClick}
    >
      Run Relayer
    </a>
  );
}

function StepTitle({ step, title }: { step: number; title: string }) {
  return (
    <div className="gap-middle flex items-center">
      <StepNumber number={step} />
      <h5 className="text-xl font-semibold text-white">{title}</h5>
    </div>
  );
}

function LabelItem({
  children,
  label,
  tips,
  className,
}: PropsWithChildren<{ label: string; tips?: string; className?: string }>) {
  return (
    <div className={`gap-middle flex flex-col ${className}`}>
      <div className="gap-small flex items-center">
        <span className="text-sm font-normal text-white">{label}</span>
        {!!tips && (
          <Tooltip content={<span className="text-xs font-normal text-white">{tips}</span>} className="w-fit">
            <Image width={16} height={16} alt="Info" src="/images/info.svg" />
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
}

function LiquidityFeeRateInput({
  placeholder,
  value,
  onChange = () => undefined,
}: {
  placeholder?: string;
  value?: { formatted: number; value: string };
  onChange?: (value: { formatted: number; value: string }) => void;
}) {
  return (
    <div className="gap-small bg-app-bg p-small lg:p-middle hover:border-line focus-within:border-line flex items-center justify-between rounded border border-transparent transition-colors">
      <input
        className="w-full text-sm font-medium text-white"
        placeholder={placeholder}
        onChange={(e) => {
          if (e.target.value) {
            if (!Number.isNaN(Number(e.target.value))) {
              onChange({ value: e.target.value, formatted: Number(e.target.value) });
            }
          } else {
            onChange({ value: e.target.value, formatted: 0 });
          }
        }}
        value={value?.value}
      />
      <span className="rounded bg-transparent text-sm font-medium text-white focus-visible:outline-none">%</span>
    </div>
  );
}

function Description({ content }: { content: string }) {
  return <span className="text-xs font-normal text-white/50">{content}</span>;
}
