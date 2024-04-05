import dynamic from "next/dynamic";

const PageSelect = dynamic(() => import("@/components/page-select"), { ssr: false });

export default function Home() {
  return <PageSelect />;
}
