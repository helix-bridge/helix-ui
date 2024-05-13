import RecordDetail from "../components/record-detail";
import PageWrap from "../ui/page-wrap";
import { useParams } from "react-router-dom";

export default function Record() {
  const params = useParams();
  return (
    <PageWrap>
      <RecordDetail id={params.id ?? ""} />
    </PageWrap>
  );
}
