import Footer from "@/components/footer";
import Header from "@/components/header";
import RecordDetail from "@/components/record-detail";
import PageWrap from "@/ui/page-wrap";

interface Props {
  params: {
    id: string;
  };
}

export default function RecordPage({ params }: Props) {
  return (
    <>
      <Header />
      <PageWrap>
        <RecordDetail id={params.id} />
      </PageWrap>
      <Footer />
    </>
  );
}
