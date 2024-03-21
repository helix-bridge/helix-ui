import RecordDetail from "@/components/record-detail";
import PageWrap from "@/ui/page-wrap";

interface Props {
  params: {
    id: string;
  };
}

export default function RecordPage({ params }: Props) {
  return (
    <PageWrap>
      <RecordDetail id={params.id} />
    </PageWrap>
  );
}
