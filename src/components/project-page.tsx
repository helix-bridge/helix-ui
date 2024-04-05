import PageWrap from "@/ui/page-wrap";
import dynamic from "next/dynamic";
import Header from "./header";
import Footer from "./footer";

const Transfer = dynamic(() => import("@/components/transfer"), { ssr: false });

export default function ProjectPage() {
  return (
    <>
      <Header />
      <PageWrap>
        <Transfer />
      </PageWrap>
      <Footer />
    </>
  );
}
