import { TokenCategory, TokenSymbol } from "../types";
import ComponentLoading from "../ui/component-loading";
import TransferSection from "./transfer-section";
import TransferTokenSelect from "./transfer-token-select";

interface TokenOption {
  logo: string;
  category: TokenCategory;
  symbol: TokenSymbol;
}

interface Props {
  loading?: boolean;
  token: TokenOption;
  options: TokenOption[];
  onChange?: (token: TokenOption) => void;
}

export default function TransferTokenSection({ token, options, loading, onChange }: Props) {
  return (
    <div className="relative">
      <ComponentLoading loading={loading} className="rounded-large backdrop-blur-[2px]" icon={false} />
      <TransferSection titleText="Token">
        <TransferTokenSelect value={token} options={options} onChange={onChange} />
      </TransferSection>
    </div>
  );
}
