import Footer from "@/components/footer";
import Header from "@/components/header";
import RecordDetail from "@/components/record-detail";
import PageWrap from "@/ui/page-wrap";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Darwinia xToken - Helix Bridge",
  description: "Darwinia xToken cross-chain powered by Helix Bridge.",
};

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
