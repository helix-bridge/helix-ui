import { Token } from "@/types";
import TransferSection from "./transfer-section";
import TransferTokenSelect from "./transfer-token-select";

interface Props {
  token: Token;
  options: Token[];
  onChange?: (token: Token) => void;
}

export default function TransferTokenSection({ token, options, onChange }: Props) {
  return (
    <TransferSection titleText="Token">
      <TransferTokenSelect value={token} options={options} onChange={onChange} />
    </TransferSection>
  );
}
