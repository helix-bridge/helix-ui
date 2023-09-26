import LnRelayerOverview from "@/components/lnrelayer-overview";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Relayers Overview | Helix Bridge",
  description: "Overview all relayers on Helix Bridge",
};

export default function RelayerOverview() {
  return (
    <main className="app-main">
      <div className="px-middle container mx-auto">
        <LnRelayerOverview />
      </div>
    </main>
  );
}
