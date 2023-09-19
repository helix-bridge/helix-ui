import { Record } from "@/types/graphql";
import { StatusTag } from "./status-tag";

interface Props {
  record?: Record | null;
}

export default function TransactionStatus({ record }: Props) {
  return (
    <div className="gap-middle flex items-center">
      <StatusTag status={record?.result} />
    </div>
  );
}
