import TokenSelect from "./token-select";

interface Props {
  isFrom?: boolean;
}

export default function TransferInput({}: Props) {
  return (
    <div className="flex items-center justify-between">
      <input placeholder="Transfer amount" />
      <TokenSelect />
    </div>
  );
}
