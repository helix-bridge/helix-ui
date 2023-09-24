import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Transfer | Helix Bridge",
  description: "Perform cross-chain transfers through Helix Bridge",
};

const Transfer = dynamic(() => import("@/components/transfer"), { ssr: false });

export default function Home() {
  return (
    <main className="app-main">
      <div className="px-middle container mx-auto lg:py-12">
        <Transfer />
      </div>
    </main>
  );
}
