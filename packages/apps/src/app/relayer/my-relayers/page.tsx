import { Metadata } from "next";
import dynamic from "next/dynamic";

const RelayerRegisterManage = dynamic(() => import("@/components/relayer-register-manage"), { ssr: false });

export const metadata: Metadata = {
  title: "My Relayers | Helix Bridge",
  description: "Register a relayer on Helix Bridge or manage my relayers registered on Helix Bridge",
};

export default function MyRelayers() {
  return (
    <main className="app-main">
      <div className="px-middle container mx-auto">
        <RelayerRegisterManage />
      </div>
    </main>
  );
}
