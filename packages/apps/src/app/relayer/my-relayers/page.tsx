import dynamic from "next/dynamic";

const RelayerRegisterManage = dynamic(() => import("@/components/relayer-register-manage"), { ssr: false });

export default function MyRelayers() {
  return (
    <main className="app-main">
      <div className="px-middle container mx-auto">
        <RelayerRegisterManage />
      </div>
    </main>
  );
}
