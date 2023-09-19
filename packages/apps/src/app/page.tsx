import dynamic from "next/dynamic";

const Transfer = dynamic(() => import("@/components/transfer"), { ssr: false });

export default function Home() {
  return (
    <main className="app-main">
      <div className="px-middle py-middle container mx-auto lg:py-12">
        <Transfer />
      </div>
    </main>
  );
}
