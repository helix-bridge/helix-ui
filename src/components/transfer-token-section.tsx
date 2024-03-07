import { TokenCategory, TokenSymbol } from "@/types";
import TransferSection from "./transfer-section";
import TransferTokenSelect from "./transfer-token-select";

interface TokenOption {
  logo: string;
  category: TokenCategory;
  symbol: TokenSymbol;
}

interface Props {
  token: TokenOption;
  options: TokenOption[];
  onChange?: (token: TokenOption) => void;
}

export default function TransferTokenSection({ token, options, onChange }: Props) {
  return (
    <TransferSection titleText="Token">
      <TransferTokenSelect value={token} options={options} onChange={onChange} />
    </TransferSection>
  );
}
