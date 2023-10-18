import RecordDetail from "@/components/record-detail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail | Helix Bridge",
  description: "View Helix Bridge transfer details",
};

interface Props {
  params: {
    id: string;
  };
}

export default function Record({ params }: Props) {
  return (
    <main className="app-main">
      <div className="px-middle container mx-auto">
        <RecordDetail id={params.id} />
      </div>
    </main>
  );
}
