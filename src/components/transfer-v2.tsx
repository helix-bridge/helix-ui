import { useCallback, useRef, useState } from "react";
import TransferTokenSection from "./transfer-token-section";
import {
  getSourceChainOptions,
  getSourceTokenOptions,
  getTargetChainOptions,
  getTargetTokenOptions,
  getTokenOptions,
  isSwitchAvailable,
} from "@/utils";
import TransferChainSection from "./transfer-chain-section";
import TransferAmountSection from "./transfer-amount-section";
import TransferInformationSection from "./transfer-information-section";
import Button from "@/ui/button";
import { useBalance } from "@/hooks";
import { useAccount } from "wagmi";

const tokenOptions = getTokenOptions();

export default function TransferV2() {
  const [token, setToken] = useState(tokenOptions[0]);
  const [amount, setAmount] = useState({ input: "", value: 0n, valid: true });
  const [sourceChain, setSourceChain] = useState(getSourceChainOptions(token.category)[0]);
  const [sourceToken, setSourceToken] = useState(getSourceTokenOptions(sourceChain, token.category)[0]);
  const [targetChain, setTargetChain] = useState(getTargetChainOptions(sourceToken)[0]);
  const [targetToken, setTargetToken] = useState(getTargetTokenOptions(sourceToken, targetChain)[0]);

  const account = useAccount();
  const { loading, balance, refresh } = useBalance(sourceChain, sourceToken, account.address);

  const tokenRef = useRef(token);
  const sourceChainRef = useRef(sourceChain);
  const sourceTokenRef = useRef(sourceToken);
  const targetChainRef = useRef(targetChain);
  const targetTokenRef = useRef(targetToken);

  const handleTokenChange = useCallback((_token: typeof token) => {
    setToken(_token);
    tokenRef.current = _token;

    const _sourceChainOptions = getSourceChainOptions(_token.category);
    const _sourceChain =
      _sourceChainOptions.find(({ id }) => id === sourceChainRef.current.id) || _sourceChainOptions[0];

    const _sourceTokenOptions = getSourceTokenOptions(_sourceChain, _token.category);
    const _sourceToken =
      _sourceTokenOptions.find(({ symbol }) => symbol === sourceTokenRef.current.symbol) || _sourceTokenOptions[0];

    const _targetChainOptions = getTargetChainOptions(_sourceToken);
    const _targetChain =
      _targetChainOptions.find(({ id }) => id === targetChainRef.current.id) || _targetChainOptions[0];

    const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
    const _targetToken =
      _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

    setSourceChain(_sourceChain);
    setSourceToken(_sourceToken);
    setTargetChain(_targetChain);
    setTargetToken(_targetToken);

    sourceChainRef.current = _sourceChain;
    sourceTokenRef.current = _sourceToken;
    targetChainRef.current = _targetChain;
    targetTokenRef.current = _targetToken;
  }, []);

  const handleSourceChainChange = useCallback((_sourceChain: typeof sourceChain) => {
    setSourceChain(_sourceChain);
    sourceChainRef.current = _sourceChain;

    const _sourceTokenOptions = getSourceTokenOptions(_sourceChain, tokenRef.current.category);
    const _sourceToken =
      _sourceTokenOptions.find(({ symbol }) => symbol === sourceTokenRef.current.symbol) || _sourceTokenOptions[0];

    const _targetChainOptions = getTargetChainOptions(_sourceToken);
    const _targetChain =
      _targetChainOptions.find(({ id }) => id === targetChainRef.current.id) || _targetChainOptions[0];

    const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
    const _targetToken =
      _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

    setSourceToken(_sourceToken);
    setTargetChain(_targetChain);
    setTargetToken(_targetToken);

    sourceTokenRef.current = _sourceToken;
    targetChainRef.current = _targetChain;
    targetTokenRef.current = _targetToken;
  }, []);

  const handleSourceTokenChange = useCallback((_sourceToken: typeof sourceToken) => {
    setSourceToken(_sourceToken);
    sourceTokenRef.current = _sourceToken;

    const _targetChainOptions = getTargetChainOptions(_sourceToken);
    const _targetChain =
      _targetChainOptions.find(({ id }) => id === targetChainRef.current.id) || _targetChainOptions[0];

    const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
    const _targetToken =
      _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

    setTargetChain(_targetChain);
    setTargetToken(_targetToken);

    targetChainRef.current = _targetChain;
    targetTokenRef.current = _targetToken;
  }, []);

  const handleTargetChainChange = useCallback((_targetChain: typeof targetChain) => {
    setTargetChain(_targetChain);
    targetChainRef.current = _targetChain;

    const _targetTokenOptions = getTargetTokenOptions(sourceTokenRef.current, _targetChain);
    const _targetToken =
      _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

    setTargetToken(_targetToken);
    targetTokenRef.current = _targetToken;
  }, []);

  const handleTargetTokenChange = useCallback((_targetToken: typeof targetToken) => {
    setTargetToken(_targetToken);
    targetTokenRef.current = _targetToken;
  }, []);

  const handleSwitch = useCallback(() => {
    const _sourceChain = targetChainRef.current;
    const _targetChain = sourceChainRef.current;

    const _sourceTokenOptions = getSourceTokenOptions(_sourceChain, tokenRef.current.category);
    const _sourceToken =
      _sourceTokenOptions.find(({ symbol }) => symbol === sourceTokenRef.current.symbol) || _sourceTokenOptions[0];

    const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
    const _targetToken =
      _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

    setSourceChain(_sourceChain);
    setSourceToken(_sourceToken);
    setTargetChain(_targetChain);
    setTargetToken(_targetToken);

    sourceChainRef.current = _sourceChain;
    sourceTokenRef.current = _sourceToken;
    targetChainRef.current = _targetChain;
    targetTokenRef.current = _targetToken;
  }, []);

  return (
    <div className="flex w-full flex-col gap-medium rounded-large bg-[#1F282C] p-medium lg:w-[27.5rem] lg:gap-5 lg:rounded-[1.25rem] lg:p-5">
      <TransferTokenSection token={token} options={tokenOptions} onChange={handleTokenChange} />
      <TransferChainSection
        sourceChain={sourceChain}
        targetChain={targetChain}
        sourceToken={sourceToken}
        targetToken={targetToken}
        disableSwitch={!isSwitchAvailable(sourceChain, targetChain, token.category)}
        sourceChainOptions={getSourceChainOptions(token.category)}
        targetChainOptions={getTargetChainOptions(sourceToken)}
        sourceTokenOptions={getSourceTokenOptions(sourceChain, token.category)}
        targetTokenOptions={getTargetTokenOptions(sourceToken, targetChain)}
        onSourceChainChange={handleSourceChainChange}
        onSourceTokenChange={handleSourceTokenChange}
        onTargetChainChange={handleTargetChainChange}
        onTargetTokenChange={handleTargetTokenChange}
        onSwitch={handleSwitch}
      />
      <TransferAmountSection
        amount={amount}
        loading={loading}
        balance={balance}
        token={sourceToken}
        onChange={setAmount}
        onRefresh={refresh}
      />
      <TransferInformationSection />
      <Button className="inline-flex h-10 items-center justify-center rounded-[0.625rem]" kind="primary">
        <span className="text-sm font-bold text-white">Transfer</span>
      </Button>
    </div>
  );
}
