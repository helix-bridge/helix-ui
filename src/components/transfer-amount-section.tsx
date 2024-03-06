import { Token } from "@/types";
import TransferSection from "./transfer-section";
import TransferAmountInput from "./transfer-amount-input";

interface Amount {
  input: string;
  value: bigint;
  valid: boolean;
}

interface Props {
  token: Token;
  amount: Amount;
  balance: bigint;
  loading?: boolean;
  onRefresh?: () => void;
  onChange?: (amount: Amount) => void;
}

export default function TransferAmountSection({ token, amount, balance, loading, onRefresh, onChange }: Props) {
  return (
    <TransferSection titleText="Amount">
      <TransferAmountInput
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
