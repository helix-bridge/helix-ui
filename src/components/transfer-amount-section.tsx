import { Token } from "@/types";
import TransferSection from "./transfer-section";
import TransferAmountInput from "./transfer-amount-input";

interface Amount {
  input: string;
  value: bigint;
  valid: boolean;
  alert: string;
}

interface Props {
  min?: bigint;
  token: Token;
  amount: Amount;
  balance: bigint;
  loading?: boolean;
  onRefresh?: () => void;
  onChange?: (amount: Amount) => void;
}

export default function TransferAmountSection({ min, token, amount, balance, loading, onRefresh, onChange }: Props) {
  return (
    <TransferSection titleText="Amount" alert={amount.alert}>
      <TransferAmountInput
        min={min}
        loading={loading}
        token={token}
        balance={balance}
        value={amount}
        onRefresh={onRefresh}
        onChange={onChange}
      />
    </TransferSection>
  );
}
