import HistoryRecords from "@/components/history-records";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Records | Helix Bridge",
  description: "View the history of transfers via the Helix Bridge",
};

export default function Records() {
  return (
    <main className="app-main">
      <div className="px-middle container mx-auto">
        <HistoryRecords />
      </div>
    </main>
  );
}
